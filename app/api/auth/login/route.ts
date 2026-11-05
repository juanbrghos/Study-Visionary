import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email.trim().toLowerCase(), password);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verifica tu usuario y contraseña.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error en el servidor' },
      { status: 500 }
    );
  }
}

