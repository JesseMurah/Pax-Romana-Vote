import { NextResponse } from "next/server"

// Mock election data - in a real app, this would come from your database
const mockElections = [
  {
    id: "presidential-2024",
    title: "Presidential Election 2024",
    description: "Choose the next President of the United States",
    candidates: [
      {
        id: "candidate-1",
        name: "John Smith",
        party: "Democratic Party",
        description: "Former Senator with 20 years of public service experience",
      },
      {
        id: "candidate-2",
        name: "Sarah Johnson",
        party: "Republican Party",
        description: "Business leader and former Governor focused on economic growth",
      },
      {
        id: "candidate-3",
        name: "Michael Brown",
        party: "Independent",
        description: "Environmental advocate and community organizer",
      },
    ],
  },
  {
    id: "senate-2024",
    title: "Senate Election 2024",
    description: "Choose your state representative in the U.S. Senate",
    candidates: [
      {
        id: "senate-1",
        name: "Lisa Davis",
        party: "Democratic Party",
        description: "Current House Representative advocating for healthcare reform",
      },
      {
        id: "senate-2",
        name: "Robert Wilson",
        party: "Republican Party",
        description: "Former military officer focused on national security",
      },
    ],
  },
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      elections: mockElections,
    })
  } catch (error) {
    console.error("Error fetching elections:", error)
    return NextResponse.json({ error: "Failed to fetch elections" }, { status: 500 })
  }
}
