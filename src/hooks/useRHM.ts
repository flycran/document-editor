import { sharedExtensions } from '@/components/DocumentEditor/extensions'

export const useRHM = () => {
  const firstRender = useRef(true)
  const [v, setV] = useState(0)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
    } else {
      setV(v + 1)
    }
    return () => {
      firstRender.current = true
    }
  }, [sharedExtensions])
  return {
    key: v,
  }
}
