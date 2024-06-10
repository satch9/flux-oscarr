fetch('../data/bd-2024.json')
  .then((response) => response.json())
  .then((data) => {
    console.log(data)

    const selectAgents = document.querySelector('#agent-select')

    console.log('selectAgents', selectAgents)

    // Extract agents and modifications
    const modifications = {}

    // Extract unique agents
    const agents = [
      ...new Set(
        Object.values(data).flatMap((date) => date.map((agent) => agent.agent)),
      ),
    ]

    console.log('agents', agents)

    // Remove the existing options

    selectAgents.innerHTML = ''

    // Add new options to the existing select element

    agents.forEach((agent) => {
      const option = document.createElement('option')

      option.value = agent

      option.text = agent

      selectAgents.appendChild(option)
    })

    selectAgents.addEventListener('change', (e) => {
      const selectedAgent = e.target.value
      // Do something with the selected agent, e.g. filter the modifications list
      console.log(`Selected agent: ${selectedAgent}`)
    })

    Object.keys(data).forEach((dateKey) => {
      data[dateKey].forEach((agent) => {
        agents[agent.numAgent] = agent.agent
        agent.lignes.forEach((modification) => {
          modifications[modification.modification] =
            (modifications[modification.modification] || 0) + 1
        })
      })
    })

    // Render modifications list
    const modificationList = document.getElementById('modification-list')
    Object.keys(modifications).forEach((modification) => {
      const modificationLi = document.createElement('li')
      modificationLi.textContent = `${
        modification === '' ? 'CREATION' : modification
      } (${modifications[modification]})`
      modificationLi.className = 'modification'
      modificationList.appendChild(modificationLi)
    })

    // Add select element to page
    selectAgents.append(agentSelect)
  })
  .catch((error) => {
    console.error('Error:', error)
  })
