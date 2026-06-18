import { sharedExtensions } from '@/components/DocumentEditor/extensions'

export const useRHM = () => {
  const [v, setV] = useState(0)
  useEffect(() => {
    setV(v + 1)
  }, [sharedExtensions])
  return {
    key: v,
  }
}
