const selectAgents = document.getElementById('agent-select')
const horaire = document.getElementById('horaire')
const dateDepart = document.getElementById('dateDepart')
const natureContrat = document.getElementById('natureContrat')
const codeService = document.getElementById('codeService')
const creation = document.getElementById('creation')
const codeRemuneration = document.getElementById('codeRemuneration')
const nom = document.getElementById('nom')
const prenom = document.getElementById('prenom')

const form = document.querySelector('form')
const yearSelect = document.querySelector('#year-select')
const submitBtn = document.querySelector('#submit-btn')

fetch('../data/bd.json')
  .then((response) => response.json())
  .then((data) => {
    console.log(data)

    submitBtn.addEventListener('click', (e) => {
      e.preventDefault() // prevent page reload

      const selectedYear = yearSelect.value

      console.log(`Selected year: ${selectedYear}`)

      let values = Object.values(data)

      const filteredData = values.map((val) => {
        return val.filter((v) => v.dateSynchronisation.split('-')[0] === selectedYear)
      
      })

      // Extract unique agents
      const agents = [
        ...new Map(
          Object.values(filteredData).flatMap((date) =>
            date.map((agent) => [agent.numAgent, agent]),
          ),
        ).values(),
      ]

      // Sort agents by numAgent
      agents.sort((a, b) => a.numAgent - b.numAgent)

      console.log('agents', agents)

      if (selectAgents) {
        // Remove the existing options
        selectAgents.innerHTML = ''

        // Add new options to the select element
        agents.forEach((agent) => {
          const option = document.createElement('option')
          option.value = agent.agent
          option.text = agent.agent
          selectAgents.appendChild(option)
        })

        selectAgents.addEventListener('change', (e) => {
          const selectedAgent = e.target.value
          // Do something with the selected agent, e.g. filter the modifications list
          console.log(`Selected agent: ${selectedAgent}`)
        })
      }

      // Extract agents and modifications
      const modifications = {}

      if (!selectAgents) {
        Object.keys(filteredData).forEach((dateKey) => {
          filteredData[dateKey].forEach((agent) => {
            agent.lignes.forEach((modification) => {
              modifications[modification.modification] =
                (modifications[modification.modification] || 0) + 1
            })
          })
        })

        console.log('modifications', modifications)

        // Render modifications

        Object.keys(modifications).forEach((modification) => {
          console.log('modification', modification)
          if (modification == 'HORAIREHEBDOMADAIRE') {
            horaire.innerText = `${modifications[modification]}`
          }
          if (modification == 'CODEREMUNERATION') {
            console.log('modification', modification)
            codeRemuneration.innerText = `${modifications[modification]}`
          }
          if (modification == 'CODESERVICE') {
            console.log('modification', modification)
            codeService.innerText = `${modifications[modification]}`
          }
          if (modification == 'DATEDEPART') {
            console.log('modification', modification)
            dateDepart.innerText = `${modifications[modification]}`
          }
          if (modification == 'NATURECONTRAT') {
            console.log('modification', modification)
            natureContrat.innerText = `${modifications[modification]}`
          }
          if (modification == '') {
            console.log('modification', modification)
            creation.innerText = `${modifications[modification]}`
          }
          if (modification == 'NOM') {
            console.log('modification', modification)
            nom.innerText = `${modifications[modification]}`
          }
          if (modification == 'PRENOM') {
            console.log('modification', modification)
            prenom.innerText = `${modifications[modification]}`
          }
        })
      }
    })
  })
  .catch((error) => {
    console.error('Error:', error)
  })
