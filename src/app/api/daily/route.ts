import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { roomName } = await request.json()
    
    if (!process.env.DAILY_API_KEY) {
      return NextResponse.json({ error: "Daily API key not configured" }, { status: 500 })
    }

    // Create a Daily.co room
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "public", // Anyone with link can join
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        },
      }),
    })

    if (!response.ok) {
      // Room might already exist, try to get it
      if (response.status === 400) {
        const getResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
          headers: {
            "Authorization": `Bearer ${process.env.DAILY_API_KEY}`,
          },
        })
        
        if (getResponse.ok) {
          const existingRoom = await getResponse.json()
          return NextResponse.json({
            url: existingRoom.url,
            name: existingRoom.name,
          })
        }
      }
      
      const errorData = await response.text()
      console.error("Daily API error:", errorData)
      return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
    }

    const room = await response.json()
    
    return NextResponse.json({
      url: room.url,
      name: room.name,
    })
  } catch (error) {
    console.error("Error creating Daily room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomName = searchParams.get("roomName")
  
  if (!roomName) {
    return NextResponse.json({ error: "Room name required" }, { status: 400 })
  }
  
  if (!process.env.DAILY_API_KEY) {
    return NextResponse.json({ error: "Daily API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      headers: {
        "Authorization": `Bearer ${process.env.DAILY_API_KEY}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ exists: false })
    }

    const room = await response.json()
    return NextResponse.json({
      exists: true,
      url: room.url,
      name: room.name,
    })
  } catch (error) {
    console.error("Error checking Daily room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
