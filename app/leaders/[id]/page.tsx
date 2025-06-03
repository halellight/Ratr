"use client"
import { useParams } from "react-router-dom"

const LeaderProfile = () => {
  const { id } = useParams()

  // Fetch leader data based on id
  const leaderData = {
    id: 1,
    name: "John Doe",
    photo: "https://example.com/johndoe.jpg",
    position: "President",
    biography: "John Doe is a seasoned leader with over 20 years of experience in politics.",
    achievements: ["Led the country through economic recovery", "Implemented major social reforms"],
    education: ["Bachelor of Arts from Harvard University", "Master of Public Administration from MIT"],
    careerHighlights: ["Served as Vice President for 5 years", "Won the national election with a landslide"],
    performanceMetrics: {
      approvalRating: 85,
      yearsInOffice: 10,
    },
  }

  return (
    <div>
      <h1>{leaderData.name}</h1>
      <img src={leaderData.photo || "/placeholder.svg"} alt={leaderData.name} />
      <h2>Position: {leaderData.position}</h2>
      <div>
        <h3>Biography</h3>
        <p>{leaderData.biography}</p>
      </div>
      <div>
        <h3>Achievements</h3>
        <ul>
          {leaderData.achievements.map((achievement, index) => (
            <li key={index}>{achievement}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Education</h3>
        <ul>
          {leaderData.education.map((education, index) => (
            <li key={index}>{education}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Career Highlights</h3>
        <ul>
          {leaderData.careerHighlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Performance Metrics</h3>
        <p>Approval Rating: {leaderData.performanceMetrics.approvalRating}%</p>
        <p>Years in Office: {leaderData.performanceMetrics.yearsInOffice}</p>
      </div>
      <div>
        <h3>Social Media Sharing</h3>
        <button>Share on Facebook</button>
        <button>Share on Twitter</button>
        <button>Share on LinkedIn</button>
      </div>
    </div>
  )
}

export default LeaderProfile
