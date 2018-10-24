import os from 'os'

export default function getNodeOS(){
  return os.platform()
}
