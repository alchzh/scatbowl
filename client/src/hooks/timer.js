import { reactive, ref, computed, watch } from '@vue/composition-api'

export function useTimer ({ delay, offline, clockDiff }) {
  let timeoutID = null

  function clearTimer () {
    clearTimeout(timeoutID)
    timeoutID = null
  }

  const status = reactive({
    startTime: null,
    stopped: true,
    resumePoint: 0
  })

  const clientStartTime = computed(() => {
    return status.startTime - clockDiff.value
  })

  const ticks = ref(0)

  const offset = computed(() =>
    clientStartTime.value % delay.value
  )

  const debug = reactive({
    lastUpdate: null,
    lastTimeout: null
  })

  function start (startTime, resumePoint) {
    status.stopped = false

    if (resumePoint) {
      status.resumePoint = resumePoint
    }

    status.startTime = Number.isInteger(startTime) ? startTime : Date.now()

    timeoutID = setTimeout(step(), Math.max(status.startTime - Date.now(), 0))
  }

  function update (now) {
    ticks.value =
      Math.floor((now + 5 - clientStartTime.value) / delay.value) +
      status.resumePoint
    return delay.value + 5 - ((now + 5 - offset.value) % delay.value)
  }

  function step () {
    if (!status.stopped) {
      const now = Date.now()
      debug.lastUpdate = now

      const toNext = update(now)
      debug.lastTimeout = toNext

      timeoutID = setTimeout(step, toNext)
    }
  }

  function stop (now) {
    status.stopped = true
    clearTimer()

    if (Number.isInteger(now)) {
      update(now)
    }

    status.resumePoint = ticks.value
  }

  function reset () {
    stop()

    ticks.value = 0
    status.resumePoint = 0
  }

  watch(delay, () => {
    if (!status.stopped && offline) {
      stop()

      start()
    }
  })

  return {
    status,
    debug,
    offset,
    ticks,
    start,
    stop,
    reset
  }
}
