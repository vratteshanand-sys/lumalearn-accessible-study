# LumaLearn Accessible Study

LumaLearn is a gentle, accessible study companion for building focus, confidence, and momentum through short guided lessons.

## Free module

- Guided reading lesson on finding the main idea
- Read-aloud support and comfort reading mode
- Practice question with immediate feedback
- Focus timer with 10- and 25-minute sessions
- Local progress tracking and text-size preferences

## Run locally

Install dependencies with `pnpm install`, then run:

`PORT=18335 BASE_PATH=/ pnpm --filter @workspace/lumalearn-study run dev`

## Published app

https://luma-learn-accessible-study-3704b4c4.base44.app/

The Base44 deployment imports this frontend's verified static production build. It is a deployment copy, not an automatic GitHub synchronization. Rebuild and redeploy after source changes. No cloud progress database, paid AI, or bank connection is used.

## Reliability improvements

- Wrong answers can be retried; completion requires the correct answer.
- Progress updates preserve the current lesson step.
- Saved browser data is checked and blocked/full storage does not stop studying.
- Speech is cancelled when leaving a lesson step.
- Focus completion updates run outside the timer's state updater.

Progress stays in the current browser. The streak and weekly visual remain simple prototype indicators rather than a complete dated activity history.
