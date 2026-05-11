import type { CatalogGroup } from "@/types/catalog";

export const mockCatalog: CatalogGroup = {
  id: "root",
  name: "National Data Catalog",
  type: "group",
  isOpen: true,
  children: [
    {
      id: "base-maps",
      name: "Base Maps",
      type: "group",
      children: [
        { id: "osm", name: "OpenStreetMap", type: "wmts", size: 10, url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", owner: "OSM Contributors" },
        { id: "aerial", name: "Aerial Imagery", type: "wmts", size: 20, owner: "Geoscience Australia" },
        { id: "topo", name: "Topographic", type: "wms", size: 8, owner: "Geoscience Australia" },
        { id: "hillshade", name: "Hillshade", type: "cog", size: 12, owner: "Geoscience Australia" },
      ],
    },
    {
      id: "boundaries",
      name: "Administrative Boundaries",
      type: "group",
      children: [
        { id: "countries", name: "Countries", type: "geojson", size: 15, tags: ["admin", "political"] },
        { id: "states", name: "States & Territories", type: "geojson", size: 12, tags: ["admin"] },
        { id: "lga", name: "Local Government Areas", type: "wfs", size: 9, tags: ["admin", "lga"] },
        { id: "postcodes", name: "Postal Codes", type: "wfs", size: 7, tags: ["admin"] },
      ],
    },
    {
      id: "environment",
      name: "Environment",
      type: "group",
      children: [
        {
          id: "land-cover",
          name: "Land Cover",
          type: "group",
          children: [
            { id: "forest", name: "Forest Cover", type: "cog", size: 30, tags: ["vegetation", "land"] },
            { id: "wetlands", name: "Wetlands", type: "wms", size: 18, tags: ["water", "land"] },
            { id: "grasslands", name: "Grasslands", type: "wms", size: 14, tags: ["vegetation", "land"] },
          ],
        },
        {
          id: "climate",
          name: "Climate",
          type: "group",
          children: [
            { id: "rainfall", name: "Mean Rainfall", type: "cog", size: 22, owner: "Bureau of Meteorology" },
            { id: "temp", name: "Temperature", type: "cog", size: 22, owner: "Bureau of Meteorology" },
            { id: "wind", name: "Wind Patterns", type: "wms", size: 14, owner: "Bureau of Meteorology" },
            { id: "solar", name: "Solar Radiation", type: "cog", size: 16, owner: "Bureau of Meteorology" },
          ],
        },
        {
          id: "biodiversity",
          name: "Biodiversity",
          type: "group",
          children: [
            { id: "species", name: "Species Observations", type: "wfs", size: 25, tags: ["fauna", "flora"] },
            { id: "protected-areas", name: "Protected Areas", type: "geojson", size: 20, tags: ["conservation"] },
          ],
        },
      ],
    },
    {
      id: "infrastructure",
      name: "Infrastructure",
      type: "group",
      children: [
        { id: "roads", name: "Roads Network", type: "wfs", size: 25, tags: ["transport"] },
        { id: "rail", name: "Rail Network", type: "geojson", size: 12, tags: ["transport"] },
        { id: "airports", name: "Airports", type: "geojson", size: 6, tags: ["transport", "aviation"] },
        { id: "ports", name: "Ports & Harbours", type: "geojson", size: 8, tags: ["transport", "maritime"] },
        { id: "buildings", name: "3D Buildings", type: "3dtiles", size: 40, tags: ["urban", "3d"] },
        { id: "power-grid", name: "Power Grid", type: "wfs", size: 18, tags: ["energy"] },
      ],
    },
    {
      id: "demographics",
      name: "Demographics & Census",
      type: "group",
      children: [
        { id: "population", name: "Population Density", type: "csv", size: 20, owner: "ABS", tags: ["census"] },
        { id: "income", name: "Household Income", type: "csv", size: 18, owner: "ABS", tags: ["census", "economy"] },
        { id: "age-dist", name: "Age Distribution", type: "csv", size: 16, owner: "ABS", tags: ["census"] },
        { id: "housing", name: "Housing Tenure", type: "csv", size: 14, owner: "ABS", tags: ["census", "housing"] },
      ],
    },
    {
      id: "elevation",
      name: "Elevation & Terrain",
      type: "group",
      children: [
        { id: "dem-1s", name: "DEM 1 Second", type: "cog", size: 35, owner: "Geoscience Australia", tags: ["terrain", "elevation"] },
        { id: "dem-5m", name: "DEM 5 Metre", type: "cog", size: 40, owner: "Geoscience Australia", tags: ["terrain", "elevation"] },
        { id: "bathymetry", name: "Bathymetry", type: "cog", size: 28, tags: ["ocean", "elevation"] },
      ],
    },
    {
      id: "deep-archive",
      name: "Deep Archive",
      type: "group",
      children: [
        { id: "da-overview", name: "Archive Overview", type: "csv", size: 4, owner: "Archives", tags: ["index"] },
        { id: "da-index-map", name: "Index Map", type: "wms", size: 6, owner: "Archives" },
        {
          id: "da-region",
          name: "Region",
          type: "group",
          children: [
            { id: "da-region-boundary", name: "Region Boundary", type: "geojson", size: 8, owner: "Archives", tags: ["boundary"] },
            { id: "da-region-pop", name: "Regional Population 1950", type: "csv", size: 5, owner: "Archives", tags: ["census"] },
            {
              id: "da-state",
              name: "State",
              type: "group",
              children: [
                { id: "da-state-boundary", name: "State Boundary", type: "geojson", size: 7, owner: "Archives", tags: ["boundary"] },
                { id: "da-state-topo", name: "State Topography", type: "cog", size: 18, owner: "Archives", tags: ["terrain"] },
                {
                  id: "da-division",
                  name: "Division",
                  type: "group",
                  children: [
                    { id: "da-division-admin", name: "Division Admin Areas", type: "wfs", size: 6, owner: "Archives" },
                    { id: "da-division-roads", name: "Division Roads 1960", type: "geojson", size: 9, owner: "Archives", tags: ["transport"] },
                    {
                      id: "da-district",
                      name: "District",
                      type: "group",
                      children: [
                        { id: "da-district-boundary", name: "District Boundary", type: "geojson", size: 5, owner: "Archives" },
                        { id: "da-district-landuse", name: "District Land Use 1970", type: "wms", size: 11, owner: "Archives", tags: ["land"] },
                        {
                          id: "da-municipality",
                          name: "Municipality",
                          type: "group",
                          children: [
                            { id: "da-muni-boundary", name: "Municipal Boundary", type: "geojson", size: 4, owner: "Archives" },
                            { id: "da-muni-census", name: "Municipal Census 1971", type: "csv", size: 7, owner: "Archives", tags: ["census"] },
                            { id: "da-muni-aerial", name: "Aerial Photo 1972", type: "wmts", size: 22, owner: "Archives", tags: ["imagery"] },
                            {
                              id: "da-ward",
                              name: "Ward",
                              type: "group",
                              children: [
                                { id: "da-ward-boundary", name: "Ward Boundary", type: "geojson", size: 3, owner: "Archives" },
                                { id: "da-ward-voters", name: "Voter Roll 1975", type: "csv", size: 6, owner: "Archives", tags: ["electoral"] },
                                {
                                  id: "da-precinct",
                                  name: "Precinct",
                                  type: "group",
                                  children: [
                                    { id: "da-precinct-boundary", name: "Precinct Boundary", type: "geojson", size: 3, owner: "Archives" },
                                    { id: "da-precinct-infra", name: "Infrastructure Survey 1978", type: "wfs", size: 8, owner: "Archives", tags: ["infrastructure"] },
                                    {
                                      id: "da-sector",
                                      name: "Sector",
                                      type: "group",
                                      children: [
                                        { id: "da-sector-zoning", name: "Sector Zoning Plan", type: "wms", size: 9, owner: "Archives", tags: ["planning"] },
                                        { id: "da-sector-soil", name: "Soil Classification", type: "cog", size: 14, owner: "Archives", tags: ["environment"] },
                                        {
                                          id: "da-zone",
                                          name: "Zone",
                                          type: "group",
                                          children: [
                                            { id: "da-zone-boundary", name: "Zone Boundary", type: "geojson", size: 3, owner: "Archives" },
                                            { id: "da-zone-permits", name: "Development Permits 1982", type: "csv", size: 5, owner: "Archives", tags: ["planning"] },
                                            {
                                              id: "da-block",
                                              name: "Block",
                                              type: "group",
                                              children: [
                                                { id: "da-block-footprints", name: "Block Footprints", type: "geojson", size: 4, owner: "Archives" },
                                                { id: "da-block-drainage", name: "Drainage Network", type: "wfs", size: 7, owner: "Archives", tags: ["water"] },
                                                {
                                                  id: "da-lot",
                                                  name: "Lot",
                                                  type: "group",
                                                  children: [
                                                    { id: "da-lot-titles", name: "Lot Titles Register", type: "csv", size: 6, owner: "Archives", tags: ["cadastre"] },
                                                    { id: "da-lot-survey", name: "Survey Plan 1985", type: "geojson", size: 4, owner: "Archives", tags: ["survey"] },
                                                    {
                                                      id: "da-parcel",
                                                      name: "Parcel",
                                                      type: "group",
                                                      children: [
                                                        { id: "da-parcel-boundary", name: "Parcel Boundary", type: "geojson", size: 3, owner: "Archives", tags: ["cadastre"] },
                                                        { id: "da-parcel-valuation", name: "Parcel Valuation 1988", type: "csv", size: 5, owner: "Archives" },
                                                        {
                                                          id: "da-subplot",
                                                          name: "Subplot",
                                                          type: "group",
                                                          children: [
                                                            { id: "da-subplot-contours", name: "Contour Lines 1:500", type: "wms", size: 8, owner: "Archives", tags: ["terrain"] },
                                                            { id: "da-subplot-veg", name: "Vegetation Survey 1990", type: "wfs", size: 6, owner: "Archives", tags: ["environment"] },
                                                            {
                                                              id: "da-unit",
                                                              name: "Unit",
                                                              type: "group",
                                                              children: [
                                                                { id: "da-unit-plan", name: "Unit Plan of Subdivision", type: "geojson", size: 3, owner: "Archives", tags: ["cadastre"] },
                                                                { id: "da-unit-strata", name: "Strata Title Records", type: "csv", size: 4, owner: "Archives" },
                                                                {
                                                                  id: "da-floor",
                                                                  name: "Floor",
                                                                  type: "group",
                                                                  children: [
                                                                    { id: "da-floor-plan", name: "Floor Plan 1993", type: "reference", size: 2, owner: "Archives" },
                                                                    { id: "da-floor-services", name: "Services Layout", type: "geojson", size: 3, owner: "Archives" },
                                                                    {
                                                                      id: "da-room",
                                                                      name: "Room",
                                                                      type: "group",
                                                                      children: [
                                                                        { id: "da-room-dims", name: "Room Dimensions", type: "csv", size: 2, owner: "Archives" },
                                                                        { id: "da-room-photo", name: "Photo Survey 1995", type: "reference", size: 1, owner: "Archives", tags: ["imagery"] },
                                                                        {
                                                                          id: "da-shelf",
                                                                          name: "Shelf",
                                                                          type: "group",
                                                                          children: [
                                                                            { id: "da-shelf-index", name: "Shelf Index", type: "csv", size: 1, owner: "Archives" },
                                                                            {
                                                                              id: "da-box",
                                                                              name: "Box",
                                                                              type: "group",
                                                                              children: [
                                                                                { id: "da-box-manifest", name: "Box Manifest", type: "csv", size: 1, owner: "Archives" },
                                                                                { id: "da-box-condition", name: "Condition Report 1998", type: "csv", size: 1, owner: "Archives" },
                                                                                {
                                                                                  id: "da-folder",
                                                                                  name: "Folder",
                                                                                  type: "group",
                                                                                  children: [
                                                                                    { id: "da-leaf-1", name: "Ancient Survey Points", type: "csv", size: 5, owner: "Archives", tags: ["survey", "historical"] },
                                                                                    { id: "da-leaf-2", name: "Boundary Markers 1901", type: "geojson", size: 3, owner: "Archives", tags: ["historical", "boundary"] },
                                                                                    { id: "da-leaf-3", name: "Triangulation Network 1901", type: "wfs", size: 4, owner: "Archives", tags: ["survey", "historical"] },
                                                                                  ],
                                                                                },
                                                                              ],
                                                                            },
                                                                          ],
                                                                        },
                                                                      ],
                                                                    },
                                                                  ],
                                                                },
                                                              ],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
