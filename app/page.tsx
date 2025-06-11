import NuvaInteract from '@/components/NuvaInteract'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">ReflectWiseAI 助理互動平台</h1>
          <p className="text-gray-600 mt-2">體驗語音 + GPT AI 的即時互動</p>
        </header>

        <NuvaInteract />
      </div>
    </main>
  )
}
