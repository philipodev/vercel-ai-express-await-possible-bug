import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { z } from 'zod'

import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

dotenv.config()

const app = express()

app.use(bodyParser.json())
app.use(cors())

app.post('/chat', async (req, res) => {
  const { messages } = req.body

  const result = await streamText({
    system: 'You are a helpful assistant',
    model: openai('gpt-4o'),
    messages,
    tools: {
      weather: {
        description: 'Get the weather for a given city',
        parameters: z.object({
          city: z.string().describe('The city to get the weather for'),
        }),
        execute: async ({ city }) => {
          // any async operation will break the stream. Try comment out the await and it will work.
          // await new Promise((resolve) => setTimeout(resolve, 1000))

          return `The weather in ${city} is extremely sunny and 1000 degrees`
        },
      },
    },
  })

  result.pipeDataStreamToResponse(res)
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
