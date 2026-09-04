import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet"
import { useEffect, useState } from "react"

import "leaflet/dist/leaflet.css"

const projects = [
  {
    id: "WB-2048",
    name: "Eastern Freight Corridor",
    state: "West Bengal",
    position: [22.5726, 88.3639],
    parcels: 248,
    status: "Compensation",
  },
  {
    id: "OD-0912",
    name: "Coastal Infrastructure Project",
    state: "Odisha",
    position: [20.2961, 85.8245],
    parcels: 164,
    status: "Scrutiny",
  },
  {
    id: "MH-7731",
    name: "Industrial Corridor",
    state: "Maharashtra",
    position: [19.076, 72.8777],
    parcels: 391,
    status: "Possession",
  },
  {
    id: "TN-5209",
    name: "Southern Rail Expansion",
    state: "Tamil Nadu",
    position: [13.0827, 80.2707],
    parcels: 207,
    status: "Notification",
  },
]

function MapViewport({ selectedProject }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedProject) return

    map.flyTo(selectedProject.position, 7, {
      duration: 1.2,
    })
  }, [selectedProject, map])

  return null
}

function ProjectMarker({ project, selected, onSelect }) {
  return (
    <>
      <CircleMarker
        center={project.position}
        radius={selected ? 25 : 18}
        pathOptions={{
          color: "#b65f3c",
          weight: 1,
          opacity: selected ? 0.65 : 0.3,
          fillColor: "#b65f3c",
          fillOpacity: 0.08,
          className: "dhara-pulse",
        }}
        eventHandlers={{
          click: () => onSelect(project),
        }}
      />

      <CircleMarker
        center={project.position}
        radius={selected ? 8 : 6}
        pathOptions={{
          color: "#171714",
          weight: 2,
          fillColor: "#b65f3c",
          fillOpacity: 1,
        }}
        eventHandlers={{
          click: () => onSelect(project),
        }}
      />
    </>
  )
}

export default function DHARAMap() {
  const [selectedProject, setSelectedProject] = useState(null)

  return (
    <div className="dhara-map-shell">
      <MapContainer
        center={[21.2, 78.9]}
        zoom={5}
        minZoom={4}
        maxZoom={10}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={true}
        className="dhara-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewport selectedProject={selectedProject} />

        {projects.map((project) => (
          <ProjectMarker
            key={project.id}
            project={project}
            selected={selectedProject?.id === project.id}
            onSelect={setSelectedProject}
          />
        ))}
      </MapContainer>

      {/* TOP LEFT */}
      <div className="dhara-map-label dhara-map-label-top">
        <span>DHARA / SPATIAL INTELLIGENCE</span>
        <strong>National project layer</strong>
      </div>

      {/* TOP RIGHT */}
      <div className="dhara-map-index">
        <span>SPATIAL LAYER</span>
        <strong>INDIA / NATIONAL</strong>
      </div>

      {/* LEFT SIDE INDEX */}
      <div className="dhara-map-stats">
        <div>
          <span>PROJECTS</span>
          <strong>247</strong>
        </div>

        <div>
          <span>PARCELS</span>
          <strong>4.8K</strong>
        </div>
      </div>

      {/* BOTTOM LEGEND */}
      <div className="dhara-map-legend">
        <span className="legend-title">ACQUISITION STATUS</span>

        <div className="legend-row">
          <i className="legend-dot active" />
          <span>ACTIVE</span>
        </div>

        <div className="legend-row">
          <i className="legend-dot review" />
          <span>REVIEW</span>
        </div>

        <div className="legend-row">
          <i className="legend-dot possession" />
          <span>POSSESSION</span>
        </div>
      </div>

      {/* PROJECT DETAIL PANEL */}
      {selectedProject && (
        <div className="dhara-project-panel">
          <button
            className="dhara-panel-close"
            onClick={() => setSelectedProject(null)}
            aria-label="Close project"
          >
            ×
          </button>

          <div className="dhara-panel-kicker">
            PROJECT / {selectedProject.id}
          </div>

          <h3>{selectedProject.name}</h3>

          <div className="dhara-panel-divider" />

          <div className="dhara-panel-data">
            <div>
              <span>STATE</span>
              <strong>{selectedProject.state}</strong>
            </div>

            <div>
              <span>PARCELS</span>
              <strong>{selectedProject.parcels}</strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong className="status-value">
                {selectedProject.status}
              </strong>
            </div>
          </div>

          <button className="dhara-open-project">
            OPEN PROJECT
            <span>↗</span>
          </button>
        </div>
      )}

      {/* BOTTOM COORDINATE STRIP */}
      <div className="dhara-coordinate-strip">
        <span>20°35′12″N</span>
        <span>/</span>
        <span>78°57′41″E</span>
      </div>
    </div>
  )
}