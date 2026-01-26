import Card from '../components/Card'
import Button from '../components/Button'

export default function Dashboard() {
  return (
    <Card title="Timer">
      <Button label="Start ►" variant="start" />
      <Button label="Stop ■" variant="stop" />
    </Card>
  )
}