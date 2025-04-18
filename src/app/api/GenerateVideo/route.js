export async function POST(request) {
    try {
      const body = await request.json();
      const { avatarId, voiceId, script } = body;
  
      if (!avatarId || !voiceId || !script) {
        return new Response(
          JSON.stringify({ message: 'Missing avatarId, voiceId, or script' }),
          { status: 400 }
        );
      }
  
      const response = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'NTQ0MGM4NjQyZjUwNGU5YjlkZmUwNzE5YzA1YWJjNDUtMTczODEyNjU2NA==',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_inputs: [
            {
              character: {
                type: 'avatar',
                avatar_id: avatarId,
                avatar_style: 'normal',
              },
              voice: {
                type: 'text',
                input_text: script,
                voice_id: voiceId,
              },
              background: {
                type: 'color',
                value: '#000000',
              },
            },
          ],
          dimension: {
            width: 1280,
            height: 720,
          },
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        return new Response(
          JSON.stringify({
            message: 'Failed to generate video',
            error: data,
          }),
          { status: 500 }
        );
      }
  
      return new Response(JSON.stringify({ video_id: data.video_id }), {
        status: 200,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ message: 'Server error', error: err.message }),
        { status: 500 }
      );
    }
  }
  