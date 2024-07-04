const selectAgents = document.getElementById("agent-select");
const horaire = document.getElementById("horaire");
const dateDepart = document.getElementById("dateDepart");
const natureContrat = document.getElementById("natureContrat");
const codeService = document.getElementById("codeService");
const creation = document.getElementById("creation");
const codeRemuneration = document.getElementById("codeRemuneration");
const nom = document.getElementById("nom");
const prenom = document.getElementById("prenom");

const yearSelect = document.querySelector("#year-select");
const timeline = document.getElementById("timeline");

function getUniqueAgents(data) {
  const allAgents = Object.values(data).flat(); // Récupérer tous les agents de toutes les dates
  const uniqueAgents = Array.from(
    new Set(allAgents.map((agent) => agent.numAgent))
  ); // Obtenir les numéros d'agents uniques
  return uniqueAgents.map((numAgent) =>
    allAgents.find((agent) => agent.numAgent === numAgent)
  ); // Retourner les informations complètes des agents uniques
}

function getAgentModifications(data, agentNum) {
  const agentModifications = [];

  for (const year in data) {
    //console.log("data getAgentModifications", data);
    //console.log("year getAgentModifications", year);
    if (data.hasOwnProperty(year)) {
      const yearData = data[year];
      //console.log("yearData getAgentModifications", yearData);
      yearData.forEach((entry) => {
        //console.log("entry.numAgent", typeof entry.numAgent);
        //console.log("agentNum", typeof agentNum);
        if (entry.numAgent === Number(agentNum)) {
          agentModifications.push(entry);
        }
      });
    }
  }
  return agentModifications;
}

function renderTimeline(modifications) {
  modifications.sort((a, b) => {
    const dateA = new Date(a.dateSynchronisation);
    const dateB = new Date(b.dateSynchronisation);
    return dateB.getTime() - dateA.getTime();
  });
  timeline.innerHTML = "";

  modifications.forEach((modification, index) => {
    const date = new Date(modification.dateSynchronisation);
    const formattedDate = date
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .join("/");

    const fullYear = date.getFullYear();
    const alignment = index % 2 === 0 ? "left" : "right";
    const textAlignClass = alignment === "left" ? "text-end" : "text-right";

    let modificationHTML = `
      <li class="timeline-item">
        <div class="timeline-content card ${alignment}">
          <div class="card-header ${textAlignClass}">
            <span style="color:#0d6efd;font-weight:bolder;">${formattedDate}</span>
          </div>
          <div class="card-body">
            
            <p class="card-text">Entité: ${modification.entite}</p>
    `;

    modification.lignes.forEach((ligne) => {
      let motif;
      switch (ligne.modification) {
        case "HORAIREHEBDOMADAIRE":
          motif = "Horaire Hebdomadaire";
          break;
        case "CODEREMUNERATION":
          motif = "Code de Rémunération";
          break;
        case "CODESERVICE":
          motif = "Code de Service";
          break;
        case "DATEDEPART":
          motif = "Date de Départ";
          break;
        case "NATURECONTRAT":
          motif = "Nature du Contrat";
          break;
        case "":
          motif = "Création";
          break;
        case "NOM":
          motif = "Nom";
          break;
        case "PRENOM":
          motif = "Prénom";
          break;
        default:
          motif = "Modification inconnue";
      }

      const avantApres =
        motif === "Création"
          ? ""
          : `<p class="card-text">${ligne.avant} => ${ligne.apres}</p>`;

      modificationHTML += `
      <p class="card-title">Modification : ${motif}</p>
      ${avantApres}
    `;
    });

    modificationHTML += `
          </div>
        </div>
      </li>
    `;

    timeline.innerHTML += modificationHTML;
  });
}

function groupByYear(data) {
  const result = {};
  Object.keys(data).forEach((key) => {
    data[key].forEach((item) => {
      const year = new Date(item.dateSynchronisation).getFullYear();
      if (!result[year]) {
        result[year] = [];
      }
      result[year].push(item);
    });
  });
  return result;
}

function getDuplicateAgents(data) {
  const agentCounts = {};
  Object.keys(data).forEach((key) => {
    data[key].forEach((item) => {
      const numAgent = item.numAgent;
      if (!agentCounts[numAgent]) {
        agentCounts[numAgent] = 1;
      } else {
        agentCounts[numAgent]++;
      }
    });
  });

  const duplicateAgents = [];
  Object.keys(agentCounts).forEach((numAgent) => {
    if (agentCounts[numAgent] > 1) {
      Object.keys(data).forEach((key) => {
        duplicateAgents.push(...data[key].filter((item) => item.numAgent === parseInt(numAgent)));
      });
    }
  });

  return duplicateAgents;
}

function loadContent(page) {
  fetch(`templates/${page}.html`)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("content").innerHTML = data;

      console.log("data", data)

      if (yearSelect) {
        // Set default year to current year
        const currentYear = new Date().getFullYear().toString();
        yearSelect.value = currentYear;
      }

      let allModifications = {}; // Variable pour stocker toutes les modifications par agent

      fetch("./data/bd.json")
        .then((response) => response.json())
        .then((data) => {

          console.log("groupByYear(data)", groupByYear(data))
          console.log("getDuplicateAgents(data)", getDuplicateAgents(data))

          if (selectAgents) {
            // Récupérer tous les agents disponibles
            const agents = getUniqueAgents(data);

            agents.sort((a, b) => a.numAgent - b.numAgent);

            //console.log("agents", agents);
            // Ajouter les agents au select
            agents.forEach((agent) => {
              const option = document.createElement("option");
              option.value = agent.numAgent;
              option.text = `${agent.agent.split(" (")[0]} - ${agent.numAgent} `;
              selectAgents.appendChild(option);
            });

            // Stocker toutes les modifications par agent
            allModifications = data;
          }

          if (yearSelect) {
            yearSelect.addEventListener("change", (e) => {
              e.preventDefault(); // prevent page reload
              const selectedYear = yearSelect.value;
              //console.log(`Selected year: ${selectedYear}`);
              let values = Object.values(data);
              const filteredData = values.map((val) => {
                return val.filter(
                  (v) => v.dateSynchronisation.split("-")[0] === selectedYear
                );
              });
              //console.log("filteredData", filteredData);

              // Extract unique agents
              const agents = [
                ...new Map(
                  Object.values(filteredData).flatMap((date) =>
                    date.map((agent) => [agent.numAgent, agent])
                  )
                ).values(),
              ];

              // Extract agents and modifications
              const modifications = {};

              Object.keys(filteredData).forEach((dateKey) => {
                filteredData[dateKey].forEach((agent) => {
                  agent.lignes.forEach((modification) => {
                    modifications[modification.modification] =
                      (modifications[modification.modification] || 0) + 1;
                  });
                });
              });

              // Render modifications
              Object.keys(modifications).forEach((modification) => {
                //console.log("modification", modification);
                if (modification == "HORAIREHEBDOMADAIRE") {
                  horaire.innerText = `${modifications[modification]}`;
                }
                if (modification == "CODEREMUNERATION") {
                  //console.log("modification", modification);
                  codeRemuneration.innerText = `${modifications[modification]}`;
                }
                if (modification == "CODESERVICE") {
                  //console.log("modification", modification);
                  codeService.innerText = `${modifications[modification]}`;
                }
                if (modification == "DATEDEPART") {
                  //console.log("modification", modification);
                  dateDepart.innerText = `${modifications[modification]}`;
                }
                if (modification == "NATURECONTRAT") {
                  //console.log("modification", modification);
                  natureContrat.innerText = `${modifications[modification]}`;
                }
                if (modification == "") {
                  //console.log("modification", modification);
                  creation.innerText = `${modifications[modification]}`;
                }
                if (modification == "NOM") {
                  //console.log("modification", modification);
                  nom.innerText = `${modifications[modification]}`;
                }
                if (modification == "PRENOM") {
                  //console.log("modification", modification);
                  prenom.innerText = `${modifications[modification]}`;
                }
              });
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      if (selectAgents) {
        selectAgents.addEventListener("change", function () {
          const selectedAgent = selectAgents.value;
          console.log("selectedAgent", selectedAgent);
          const agentModifications = getAgentModifications(
            allModifications,
            selectedAgent
          );
          console.log(agentModifications);
          renderTimeline(agentModifications);
          // Faites quelque chose avec les modifications de l'agent sélectionné, comme les afficher dans l'interface utilisateur
        });
      }


    })
    .catch(error => console.error("Error loading template:", error))
};

window.onload = function () {
  loadTemplate("header.html", "header")
  loadTemplate("footer.html", "footer")
  loadContent("home")
}
