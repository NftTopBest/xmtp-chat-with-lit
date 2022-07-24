import loaderStyles from '../styles/Loader.module.css'

type LoaderProps = {
  isLoading: boolean
}

type StyledLoaderProps = {
  headingText: string
  subHeadingText: string
  isLoading: boolean
}

export const Spinner = ({ isLoading }: LoaderProps): JSX.Element | null => {
  if (!isLoading) {
    return null
  }

  // This feels janky af, but I'm gonna run with it rather than import some bloated library just to make a spinner.
  return (
    <div className={loaderStyles['lds-roller']}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export const Loader = ({
  headingText,
  subHeadingText,
  isLoading,
}: StyledLoaderProps): JSX.Element => (
  <div className="grid h-full place-items-center">
    <div className="text-center columns-1">
      <Spinner isLoading={isLoading} />
      <div className="text-xl font-bold md:text-lg text-n-200 md:text-n-300">
        {headingText}
      </div>
      <div className="font-normal text-lx md:text-md text-n-200">
        {subHeadingText}
      </div>
    </div>
  </div>
)

export default Loader
