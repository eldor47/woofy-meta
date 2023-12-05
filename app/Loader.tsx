import { useEffect } from 'react'

export default function Loader() {
  useEffect(() => {
    async function getLoader() {
      const { spiral } = await import('ldrs')
      spiral.register()
    }
    getLoader()
  }, [])
  return <div style={{width: "100%", display: 'flex', justifyContent: "center"}}><l-spiral color="white"></l-spiral></div>
}