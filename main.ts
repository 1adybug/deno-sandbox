import { Hono } from "@hono/hono"
import { z } from "zod"

const app = new Hono()

const schema = z.object({
    script: z.string().min(1),
    timeout: z.number().int().min(1).max(30).optional(),
})

app.post("/", async c => {
    let script: string | undefined
    let timeout: number | undefined

    try {
        const body = await c.req.json()
        const info = schema.parse(body)
        script = info.script
        timeout = info.timeout ?? 30
    } catch (error) {
        return c.json(
            {
                success: false,
                data: null,
                message: "Invalid request body",
            },
            400
        )
    }

    const blob = new Blob([script], { type: "text/javascript" })
    const url = URL.createObjectURL(blob)

    const worker = new Worker(url, {
        type: "module",
        deno: {
            permissions: "none",
        },
    })

    return new Promise(resolve => {
        worker.addEventListener("message", event => {
            URL.revokeObjectURL(url)
            worker.terminate()
            resolve(
                c.json({
                    success: true,
                    data: event.data,
                    message: null,
                })
            )
        })

        worker.addEventListener("error", event => {
            URL.revokeObjectURL(url)
            worker.terminate()
            event.preventDefault()
            resolve(
                c.json({
                    success: false,
                    data: null,
                    message: "script error",
                })
            )
        })

        worker.addEventListener("unhandledrejection", event => {
            URL.revokeObjectURL(url)
            worker.terminate()
            event.preventDefault()
            resolve(
                c.json({
                    success: false,
                    data: null,
                    message: "script error",
                })
            )
        })

        setTimeout(() => {
            URL.revokeObjectURL(url)
            worker.terminate()
            resolve(
                c.json({
                    success: false,
                    data: null,
                    message: "timeout",
                })
            )
        }, timeout * 1000)
    })
})

Deno.serve({ port: 80 }, app.fetch)
