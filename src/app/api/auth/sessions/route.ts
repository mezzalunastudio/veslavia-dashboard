// app/api/sessions/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sessions`, {
      headers: { 
        Cookie: cookieString,
      },
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Failed to fetch sessions');
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('id');
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/sessions/${sessionId}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: cookieString,
        },
        credentials: 'include'
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to delete session')
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}