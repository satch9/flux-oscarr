/* function getUniqueAgents(data) {
  const allAgents = Object.values(data).flat() // Récupérer tous les agents de toutes les dates
  const uniqueAgents = Array.from(
    new Set(allAgents.map((agent) => agent.numAgent)),
  ) // Obtenir les numéros d'agents uniques
  return uniqueAgents.map((numAgent) =>
    allAgents.find((agent) => agent.numAgent === numAgent),
  ) // Retourner les informations complètes des agents uniques
} */

function getUniqueAgents(data) {
  const allAgents = Object.values(data).flat() // Get all agents across all dates
  const uniqueAgents = Array.from(
    new Set(allAgents.map((agent) => agent.numAgent)),
  ) // Get unique agent numbers
  return uniqueAgents.map((numAgent) =>
    allAgents.find((agent) => agent.numAgent === numAgent),
  ) // Return unique agent data
}

function getAgentModifications(data, agentNum) {
  const agentModifications = []

  for (const year in data) {
    //console.log("data getAgentModifications", data);
    //console.log("year getAgentModifications", year);
    if (data.hasOwnProperty(year)) {
      const yearData = data[year]
      //console.log("yearData getAgentModifications", yearData);
      yearData.forEach((entry) => {
        //console.log("entry.numAgent", typeof entry.numAgent);
        //console.log("agentNum", typeof agentNum);
        if (entry.numAgent === Number(agentNum)) {
          agentModifications.push(entry)
        }
      })
    }
  }
  return agentModifications
}

function getAgentsSansEntites(data) {
  const agentsSansEntites = []
  for (const year in data) {
    if (data.hasOwnProperty(year)) {
      const yearData = data[year]
      yearData.forEach((entry) => {
        if (entry.entite === '') {
          agentsSansEntites.push(entry)
        }
      })
    }
  }
  console.log('agentsSansEntites', agentsSansEntites)
  return agentsSansEntites
}

function renderTimeline(modifications) {
  modifications.sort((a, b) => {
    const dateA = new Date(a.dateSynchronisation)
    const dateB = new Date(b.dateSynchronisation)
    return dateB.getTime() - dateA.getTime()
  })
  timeline.innerHTML = ''

  modifications.forEach((modification, index) => {
    const date = new Date(modification.dateSynchronisation)
    const formattedDate = date
      .toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .split('/')
      .join('/')

    const fullYear = date.getFullYear()
    const alignment = index % 2 === 0 ? 'left' : 'right'
    const textAlignClass = alignment === 'left' ? 'text-end' : 'text-right'

    let modificationHTML = `
      <li class="timeline-item">
        <div class="timeline-content card ${alignment}">
          <div class="card-header ${textAlignClass}">
            <span style="color:#0d6efd;font-weight:bolder;">${formattedDate}</span>
          </div>
          <div class="card-body">
            
            <p class="card-text">Entité: ${modification.entite}</p>
    `

    modification.lignes.forEach((ligne) => {
      let motif
      switch (ligne.modification) {
        case 'HORAIREHEBDOMADAIRE':
          motif = 'Horaire Hebdomadaire'
          break
        case 'CODEREMUNERATION':
          motif = 'Code de Rémunération'
          break
        case 'CODESERVICE':
          motif = 'Code de Service'
          break
        case 'DATEDEPART':
          motif = 'Date de Départ'
          break
        case 'NATURECONTRAT':
          motif = 'Nature du Contrat'
          break
        case '':
          motif = 'Création'
          break
        case 'NOM':
          motif = 'Nom'
          break
        case 'PRENOM':
          motif = 'Prénom'
          break
        default:
          motif = 'Modification inconnue'
      }

      const avantApres =
        motif === 'Création'
          ? ''
          : `<p class="card-text">${ligne.avant} => ${ligne.apres}</p>`

      modificationHTML += `
      <p class="card-title">Modification : ${motif}</p>
      ${avantApres}
    `
    })

    modificationHTML += `
          </div>
        </div>
      </li>
    `

    timeline.innerHTML += modificationHTML
  })
}

function groupByYear(data) {
  const result = {}
  Object.keys(data).forEach((key) => {
    data[key].forEach((item) => {
      const year = new Date(item.dateSynchronisation).getFullYear()
      if (!result[year]) {
        result[year] = []
      }
      result[year].push(item)
    })
  })
  return result
}

function getDuplicateAgents(data) {
  const agentCounts = {}
  Object.keys(data).forEach((key) => {
    data[key].forEach((item) => {
      const numAgent = item.numAgent
      if (!agentCounts[numAgent]) {
        agentCounts[numAgent] = 1
      } else {
        agentCounts[numAgent]++
      }
    })
  })

  const duplicateAgents = []
  Object.keys(agentCounts).forEach((numAgent) => {
    if (agentCounts[numAgent] > 1) {
      Object.keys(data).forEach((key) => {
        duplicateAgents.push(
          ...data[key].filter((item) => item.numAgent === parseInt(numAgent)),
        )
      })
    }
  })

  return duplicateAgents
}

function handleYearChange(data, yearSelect) {
  const selectedYear = yearSelect.value
  let values = Object.values(data)
  const filteredData = values.map((val) => {
    return val.filter(
      (v) => v.dateSynchronisation.split('-')[0] === selectedYear,
    )
  })

  const modifications = {}
  Object.keys(filteredData).forEach((dateKey) => {
    filteredData[dateKey].forEach((agent) => {
      agent.lignes.forEach((modification) => {
        modifications[modification.modification] =
          (modifications[modification.modification] || 0) + 1
      })
    })
  })

  //console.log("modifications", modifications)
  renderModifications(modifications)
}

function renderModifications(modifications) {
  const horaire = document.getElementById('horaire')
  const dateDepart = document.getElementById('dateDepart')
  const natureContrat = document.getElementById('natureContrat')
  const codeService = document.getElementById('codeService')
  const creation = document.getElementById('creation')
  const codeRemuneration = document.getElementById('codeRemuneration')
  const nom = document.getElementById('nom')
  const prenom = document.getElementById('prenom')

  if (modifications.HORAIREHEBDOMADAIRE) {
    horaire.innerText = `${modifications.HORAIREHEBDOMADAIRE}`
  }
  if (modifications.CODEREMUNERATION) {
    codeRemuneration.innerText = `${modifications.CODEREMUNERATION}`
  }
  if (modifications.CODESERVICE) {
    codeService.innerText = `${modifications.CODESERVICE}`
  }
  if (modifications.DATEDEPART) {
    dateDepart.innerText = `${modifications.DATEDEPART}`
  }
  if (modifications.NATURECONTRAT) {
    natureContrat.innerText = `${modifications.NATURECONTRAT}`
  }
  if (modifications['']) {
    creation.innerText = `${modifications['']}`
  }
  if (modifications.NOM) {
    nom.innerText = `${modifications.NOM}`
  }
  if (modifications.PRENOM) {
    prenom.innerText = `${modifications.PRENOM}`
  }
}

function createLi(data, elementID) {
  let numColummns
  if (elementID === 'columns-container') {
    numColummns = 4
  } else {
    numColummns = 1
  }

  const itemsPerColumn = Math.ceil(data.length / numColummns)
  const container = document.getElementById(elementID)

  for (let i = 0; i < numColummns; i++) {
    const column = document.createElement('div')
    column.className = 'col'
    const ol = document.createElement('ol')
    ol.className = 'list-group list-group-numbered'
    for (let j = 0; j < itemsPerColumn; j++) {
      const itemIndex = i * itemsPerColumn + j
      if (itemIndex < data.length) {
        const li = document.createElement('li')
        li.className = 'list-group-item'

        if (elementID === 'columns-container') {
          li.textContent = `${data[itemIndex].numAgent} - ${
            data[itemIndex].agent.split(' (')[0]
          }`
        } else {
          li.textContent = `${data[itemIndex]}`
        }

        /* li.textContent = `${data[itemIndex].numAgent} - ${data[itemIndex].agent.split(' (')[0]} || ${(new Date(data[itemIndex].dateSynchronisation)).getFullYear()} ` */
        ol.appendChild(li)
      }
    }
    column.appendChild(ol)
    container.appendChild(column)
  }
}

function createOrgChart(data, parentElement) {
  const ul = document.createElement('ul')
  ul.classList.add('list-group')

  data.forEach((item) => {
    const li = document.createElement('li')
    li.classList.add('list-group-item')
    li.textContent = `${item.code} ${item.libelle} (${item.Niveau})`

    // Ajout de classes spécifiques en fonction du niveau
    switch (item.Niveau) {
      case 'Direction':
        li.classList.add('direction')
        break
      case 'Sous-Direction':
        li.classList.add('sous-direction')
        break
      case 'Département':
        li.classList.add('departement')
        break
      case 'Service':
        li.classList.add('service')
        break
      case 'Pôle':
        li.classList.add('pole')
        break
    }

    ul.appendChild(li)

    if (item.children) {
      const childUl = createOrgChart(item.children, ul)
      li.appendChild(childUl)
    }
  })

  parentElement.appendChild(ul)
  return ul
}

function renderAgentOptions(agents) {
  const selectAgents = document.getElementById('agent-select')
  selectAgents.innerHTML = '' // Clear existing options

  agents.sort((a, b) => a.numAgent - b.numAgent) // Sort agents by numAgent

  agents.forEach((agent) => {
    const option = document.createElement('option')
    option.value = agent.numAgent
    option.text = `${agent.agent.split(' (')[0]} - ${agent.numAgent}`
    selectAgents.appendChild(option)
  })
}

function loadContent(page, element) {
  fetch(`templates/${page}.html`)
    .then((response) => response.text())
    .then((dataContent) => {
      document.getElementById('content').innerHTML = dataContent

      // mise à jour de classes des éléments de navigation
      const navLinks = document.querySelectorAll('.nav-link')
      navLinks.forEach((link) => {
        link.classList.remove('active')
      })

      if (element) {
        element.classList.add('active')
      }

      const selectAgents = document.getElementById('agent-select')
      const yearSelect = document.querySelector('#year-select')
      //const timeline = document.getElementById("timeline");
      const sansEntites = document.getElementById('sansEntites')
      const agentsPartisCheckbox = document.querySelector('#agentsDeparts')

      if (yearSelect) {
        // Set default year to current year
        const currentYear = new Date().getFullYear().toString()
        yearSelect.value = currentYear
      }

      let allModifications = {} // Variable pour stocker toutes les modifications par agent
      let allAgents = []
      let filteredAgents = []

      fetch('./data/bd.json')
        .then((response) => response.json())
        .then((dataDB) => {
          allAgents = getUniqueAgents(dataDB)

          if (page === 'home') {
            let pdfArray = Object.keys(dataDB)
            let pdfArray10FirstElements = pdfArray.slice(0, 10)
            createLi(pdfArray10FirstElements, 'pdf-columns-container')
          }

          // If checkbox is clicked, filter agents
          if (agentsPartisCheckbox) {
            agentsPartisCheckbox.addEventListener('change', (e) => {
              if (e.target.checked) {
                // Filter agents that have 'Depart' in entite (i.e., left the company)
                filteredAgents = allAgents.filter(
                  (agent) => agent.entite.trim() === 'Depart',
                )
              } else {
                // If unchecked, show all agents
                filteredAgents = allAgents
              }
              // Render the filtered agents
              renderAgentOptions(filteredAgents)
            })
          }

          /* if (selectAgents) {
            let agents
            agentsPartis.addEventListener('click', (e) => {
              agents = getUniqueAgents(dataDB)
              console.log('agents avant ', agents)

              if (e.target.checked) {
                agents.map((agent) => agent.entite.trim() !== 'Depart')
                console.log('agents après', agents)
              } else {
                agents = getUniqueAgents(dataDB)
              }
              agents.sort((a, b) => a.numAgent - b.numAgent)

              agents.forEach((agent) => {
                const option = document.createElement('option')
                option.value = agent.numAgent
                option.text = `${agent.agent.split(' (')[0]} - ${
                  agent.numAgent
                } `
                selectAgents.appendChild(option)
              })
            })

            allModifications = dataDB
          } */

          if (yearSelect) {
            yearSelect.addEventListener('change', (e) => {
              e.preventDefault()
              handleYearChange(dataDB, yearSelect)
            })
          }

          if (selectAgents) {
            selectAgents.addEventListener('change', function () {
              const selectedAgent = selectAgents.value
              const agentModifications = getAgentModifications(
                allModifications,
                selectedAgent,
              )
              renderTimeline(agentModifications)
            })
          }

          if (sansEntites) {
            let agentsSansEntites = getAgentsSansEntites(dataDB)

            agentsSansEntites.sort((a, b) => b.numAgent - a.numAgent)

            agentsSansEntites = getUniqueAgents(agentsSansEntites)

            const titreNbreAgentsSansEntites = document.getElementById(
              'titreNbreAgentsSansEntites',
            )
            titreNbreAgentsSansEntites.innerHTML = `Nombre d'agents : ${agentsSansEntites.length}`

            createLi(agentsSansEntites, 'columns-container')
          }
        })
        .catch((error) => {
          console.error('Error:', error)
        })

      const orgChartContainer = document.getElementById('org-chart')
      const date_validite = document.getElementById('date_validite')

      if (orgChartContainer) {
        fetch('./data/entites.json')
          .then((response) => response.json())
          .then((dataStructureEntites) => {
            console.log('dataStructureEntites', dataStructureEntites)
            for (const key in dataStructureEntites) {
              console.log('key', key)
              dataStructureEntites[key].forEach((entite) => {
                console.log('structure', entite)
                if (date_validite) {
                  date_validite.innerHTML = `En date du ${entite.date_validite_schema}`
                }

                createOrgChart(entite.structure, orgChartContainer)
              })
            }
          })
          .catch((error) => {
            console.error('Error:', error)
          })
      }
    })
    .catch((error) => console.error('Error loading template:', error))
}

window.onload = function () {
  loadTemplate('header.html', 'header')
  loadTemplate('footer.html', 'footer')
  loadContent('home')
}
