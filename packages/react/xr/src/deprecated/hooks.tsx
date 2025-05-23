import { PointerEvent } from '@pmndrs/pointer-events'
import { XRControllerState, XRGazeState, XRHandState, XRScreenInputState, XRTransientPointerState } from '@pmndrs/xr'
import { RefObject, useEffect, useRef } from 'react'
import { Group, Intersection, XRControllerEventType as ThreeXRControllerEventType } from 'three'
import { useXRInputSourceState, useXRInputSourceStateContext } from '../input.js'
import { useXRSpace } from '../space.js'
import { useXR } from '../xr.js'

const eventTranslations = {
  onBlur: 'pointerleave',
  onHover: 'pointerenter',
  onMove: 'pointermove',
  onSelect: {
    type: 'click',
    filter: (e) => e.pointerType === 'ray',
  },
  onSelectEnd: {
    type: 'pointerup',
    filter: (e) => e.pointerType === 'ray',
  },
  onSelectStart: {
    type: 'pointerdown',
    filter: (e) => e.pointerType === 'ray',
  },
  onSqueeze: {
    type: 'click',
    filter: (e) => e.pointerType === 'grab',
  },
  onSqueezeEnd: {
    type: 'pointerup',
    filter: (e) => e.pointerType === 'grab',
  },
  onSqueezeStart: {
    type: 'pointerdown',
    filter: (e) => e.pointerType === 'grab',
  },
} satisfies Record<string, string | { type: string; filter: (event: PointerEvent) => boolean }>

/**
 * @deprecated Use normal react-three/fiber event listeners instead (e.g. `<mesh onClick={...} />`)
 */
export function useInteraction(
  ref: RefObject<Group | null>,
  type: keyof typeof eventTranslations,
  handler?: (event: { intersection: Intersection; intersections: Array<Intersection>; target: any }) => void,
) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  useEffect(() => {
    const { current } = ref
    if (current == null) {
      return
    }
    const translation = eventTranslations[type]
    const fn =
      typeof translation === 'string'
        ? (event: PointerEvent) =>
            handlerRef.current?.({ intersection: event, intersections: [event], target: event.pointerState })
        : (event: PointerEvent) => {
            if (event instanceof PointerEvent && !translation.filter(event)) {
              return
            }
            handlerRef.current?.({ intersection: event, intersections: [event], target: event.pointerState })
          }
    const eventName = typeof translation === 'string' ? translation : translation.type
    current.addEventListener(eventName as any, fn)
    return () => current.removeEventListener(eventName as any, fn)
  }, [ref, type])
}

/**
 * @deprecated Implement custom listeners instead
 */
export function useXREvent(
  type: Exclude<ThreeXRControllerEventType, XRSessionEventType | 'connected' | 'disconnected'>,
  handler: (event: {
    type: Exclude<ThreeXRControllerEventType, XRSessionEventType | 'connected' | 'disconnected'>
    data: XRInputSource
  }) => void,
  { handedness }: { handedness?: XRHandedness } = {},
) {
  const session = useXR((xr) => xr.session)
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  useEffect(() => {
    if (session == null) {
      return
    }
    const fn = (e: XRInputSourceEvent) => {
      handlerRef.current?.({
        type: e.type,
        data: e.inputSource,
      })
    }
    session.addEventListener(type, fn)
    return () => session.removeEventListener(type, fn)
  }, [session, handedness, type])
}

/**
 * Hook for getting the transient-pointer state
 *
 * @param handedness the handedness that the XRHandState should have
 * @deprecated use `useXRInputSourceState("transientPointer", "left")` instead
 */
export function useXRTransientPointerState(handedness: XRHandedness): XRTransientPointerState | undefined

/**
 * Hook for getting the transient-pointer state inside the xr store config
 *
 * @deprecated use `useXRInputSourceStateContext("transientPointer")` instead
 */
export function useXRTransientPointerState(): XRTransientPointerState

export function useXRTransientPointerState(handedness?: XRHandedness) {
  return handedness == null
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useXRInputSourceStateContext('transientPointer')
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useXRInputSourceState('transientPointer', handedness)
}

/**
 * Hook for getting the gaze state
 *
 * @deprecated use `useXRInputSourceStateContext("gaze")` instead
 */
export function useXRGazeState(): XRGazeState {
  return useXRInputSourceStateContext('gaze')
}

/**
 * Hook for getting the screen-input state
 *
 * @deprecated `useXRInputSourceStateContext("screenInput")` instead
 */
export function useXRScreenInputState(): XRScreenInputState {
  return useXRInputSourceStateContext('screenInput')
}

/**
 * Hook for getting the XRHandState
 *
 * @param handedness the handedness that the XRHandState should have
 * @deprecated use `useXRInputSourceState("hand", "left")` instead
 */
export function useXRHandState(handedness: XRHandedness): XRHandState | undefined

/**
 * Hook for getting the XRHandState
 *
 * @deprecated `useXRInputSourceStateContext("hand")` instead
 */
export function useXRHandState(): XRHandState

export function useXRHandState(handedness?: XRHandedness): XRHandState | undefined {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return handedness == null ? useXRInputSourceStateContext('hand') : useXRInputSourceState('hand', handedness)
}

/**
 * Hook for getting the XRControllerState
 *
 * @param handedness the handedness that the XRControllerState should have
 * @deprecated use `useXRInputSourceState("controller", "left")` instead
 */
export function useXRControllerState(handedness: XRHandedness): XRControllerState | undefined

/**
 * Hook for getting the XRControllerState
 *
 * @deprecated `useXRInputSourceStateContext("controller")` instead
 */
export function useXRControllerState(): XRControllerState

export function useXRControllerState(handedness?: XRHandedness): XRControllerState | undefined {
  return handedness == null
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useXRInputSourceStateContext('controller')
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useXRInputSourceState('controller', handedness)
}

/**
 * @deprecated use `useXRSpace` instead
 */
export const useXRReferenceSpace = useXRSpace
