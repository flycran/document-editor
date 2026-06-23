import styles from './AutoWidthInput.module.scss'

export interface AutoWidthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputClassName?: string
}

export default function AutoWidthInput({
  type = 'text',
  className,
  inputClassName,
  defaultValue,
  value,
  onChange,
  ...rest
}: AutoWidthInputProps) {
  const [$value, $setValue] = useState(defaultValue)

  const inputRef = useRef<HTMLInputElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (inputRef.current && measureRef.current) {
      inputRef.current.style.width = `${measureRef.current.offsetWidth}px`
    }
  }, [$value])

  useEffect(() => {
    $setValue(value)
  }, [value])

  return (
    <span className={clsx(styles.autoWidthInput, className)}>
      <span ref={measureRef} className={styles.measure}>
        {$value}
      </span>
      <input
        {...rest}
        ref={inputRef}
        className={clsx(styles.input, inputClassName)}
        defaultValue={defaultValue}
        value={$value}
        onChange={(e) => {
          onChange?.(e)
          $setValue(e.target.value)
        }}
        type={type}
      />
    </span>
  )
}
