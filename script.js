let characters = []; // globális, hogy elérhető legyen szerepfelfedéshez
let currentPlayerIndex = 0;
let playerCount = 0;
let currentRoundIndex = 0;
let currentRoundVoteIndex = 0;
let results = [null, null, null, null, null];
let doubleFailRequired = false;
const missionSizesByPlayerCount = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5]
};
class Character {
  constructor(name, description, team, picture) {
    this.name = name;
    this.description = description;
    this.team = team;
    this.picture = picture
  }
}

function startGame() {
  playerCount = parseInt(document.getElementById("playerCount").value);
  doubleFailRequired = playerCount >= 7;
  const maxVillainsByPlayerCount = {
    5: 2,
    6: 2,
    7: 3,
    8: 3,
    9: 3,
    10: 4
  };

  const selectedVillains = ['morgana', 'mordred', 'oberon'].filter(id => document.getElementById(id).checked);
  const selectedGoods = ['percival'].filter(id => document.getElementById(id).checked);

  const maxVillains = maxVillainsByPlayerCount[playerCount];
  const maxOptionalVillains = maxVillains - 1; // Assassin mindig benne van

  if (selectedVillains.length > maxOptionalVillains) {
    const alertDiv = document.getElementById("alert");
    alertDiv.innerHTML = `
    <div class="alert alert-danger" role="alert">
      Túl sok speciális rossz karakter! Maximum ${maxOptionalVillains} választható a kötelező Assassin mellett.
    </div>`;
    document.querySelectorAll('#morgana, #mordred, #oberon').forEach(cb => cb.checked = false);
    setTimeout(() => {
      alertDiv.innerHTML = '';
    }, 3000);
    return;
  }

  characters = []
  // Kötelező karakterek
  characters.push(new Character("Merlin", "Knows the villains", "Good", "pictures/merlin.png"));
  characters.push(new Character("Assassin", "Attempts to guess Merlin", "Villain", "pictures/assasin.png"));

  // Speciális rossz karakterek
  if (document.getElementById("morgana").checked) {
    characters.push(new Character("Morgana", "Appears as Merlin to Percival", "Villain", "pictures/morgana.png"));
  }
  if (document.getElementById("mordred").checked) {
    characters.push(new Character("Mordred", "Hidden from Merlin", "Villain", "pictures/mordred.png"));
  }
  if (document.getElementById("oberon").checked) {
    characters.push(new Character("Oberon", "Unknown to fellow villains", "Villain", "pictures/oberon.png"));
  }

  // Speciális jó karakterek
  if (document.getElementById("percival").checked) {
    characters.push(new Character("Percival", "Knows who might be Merlin", "Good", "pictures/percival.png"));
  }

  // Számolás: mennyi karakter van még hátra
  const currentCount = characters.length;
  const missing = playerCount - currentCount;

  // Hány jó és rossz karakter kell még?
  const currentVillains = characters.filter(c => c.team === "Villain").length;
  const currentGoods = characters.filter(c => c.team === "Good").length;

  const missingVillains = maxVillains - currentVillains;
  const missingGoods = (playerCount - maxVillains) - currentGoods;

  for (let i = 0; i < missingVillains; i++) {
    characters.push(new Character("Minion of Mordred", "A loyal minion of evil", "Villain", "pictures/minion.png"));
  }

  for (let i = 0; i < missingGoods; i++) {
    characters.push(new Character("Loyal Servant of Arthur", "Faithful to Arthur, no special power", "Good", "pictures/loyal_servant.png"));
  }

  // Keverés
  shuffle(characters);

  console.log("Kiosztott karakterek:", characters);
  // → majd itt mehetünk tovább a szerepfelfedésre!
  showNextCharacter();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


// --- ÚJ RÉSZ: Szerepfelfedés ---

function showNextCharacter() {
  const body = document.body;
  body.innerHTML = '';

  if (currentPlayerIndex >= characters.length) {
    renderMissionBoard(results);
    return;
  }

  const container = document.createElement("div");
  container.className = "card-container";

  // biztosítjuk, hogy az animáció ténylegesen lejátszódjon
  requestAnimationFrame(() => {
    container.classList.add("animate-in");
  });

  const card = document.createElement("div");
  card.className = "card";

  // FRONT oldal
  const front = document.createElement("div");
  front.className = "card-front";

  const instruction = document.createElement("h2");
  instruction.textContent = `Player ${currentPlayerIndex + 1}, készen állsz?`;
  front.appendChild(instruction);

  const revealButton = document.createElement("button");
  revealButton.textContent = "Mutasd a szerepem";
  revealButton.onclick = () => {
    card.classList.add("flipped");
  };
  front.appendChild(revealButton);

  // BACK oldal
  const back = document.createElement("div");
  back.className = "card-back";

  const character = characters[currentPlayerIndex];

  const img = document.createElement("img");
  img.src = character.picture;
  img.alt = character.name;
  img.className = "character-image";
  back.appendChild(img);

  const name = document.createElement("h2");
  name.textContent = character.name;
  back.appendChild(name);

  const team = document.createElement("p");
  team.textContent = `Csapat: ${character.team}`;
  team.className = `team-${character.team.toLowerCase()}`;
  back.appendChild(team);

  const desc = document.createElement("p");
  desc.textContent = character.description;
  back.appendChild(desc);

  const nextButton = document.createElement("button");
  nextButton.textContent = "Továbbadom a telefont";
  nextButton.className = "next-button";
  nextButton.onclick = () => {
    container.classList.remove("animate-in");
    container.classList.add("animate-out");

    setTimeout(() => {
      currentPlayerIndex++;
      showNextCharacter();
    }, 400);
  };
  back.appendChild(nextButton);

  // Összerakás
  card.appendChild(front);
  card.appendChild(back);
  container.appendChild(card);
  body.appendChild(container);
}


function renderMissionBoard(results) {
  document.body.innerHTML = '';

  const title = document.createElement("h2");
  title.textContent = "Küldetésállapot";
  document.body.appendChild(title);

  const table = document.createElement("table");
  const missionSizes = missionSizesByPlayerCount[playerCount];
  console.log(results);
  for (let i = 5; i >= 1; i--) {
    const row = document.createElement("tr");

    // Bal oszlop: küldetésszám + játékosszám
    const missionLabel = document.createElement("td");
    let extraNote = '';
    if (i === 4 && doubleFailRequired) {
      extraNote = ' – 2 elutasítás szükséges';
    }
    missionLabel.textContent = `Küldetés ${i}. (${missionSizes[i - 1]} fő)${extraNote}`;
    row.appendChild(missionLabel);
    // Jobb oszlop: eredmény vagy üres
    const missionStatus = document.createElement("td");
    const result = results[i - 1];
    if (result === true) {
      missionStatus.textContent = "✅";
    } else if (result === false) {
      missionStatus.textContent = "❌";
    } else {
      missionStatus.textContent = ""; // még nincs eredmény
    }

    row.appendChild(missionStatus);
    table.appendChild(row);
  }

  document.body.appendChild(table);

  // --- Gomb hozzáadása a táblázat alá ---
  // Ellenőrzés, hány sikeres és sikertelen küldetés van
  const successCount = results.filter(r => r === true).length;
  const failCount = results.filter(r => r === false).length;

  if (failCount >= 3) {
    const message = document.createElement("p");
    message.textContent = "A rosszak nyertek.";
    document.body.appendChild(message);
  } else if (successCount >= 3) {
    const message = document.createElement("p");
    message.textContent = "A rosszak fedjék fel magukat és az orgyilkos tippelje meg Merlint!";
    document.body.appendChild(message);
  } else if (currentRoundIndex < 5 && results[currentRoundIndex] === null) {
    const button = document.createElement("button");
    button.textContent = `${currentRoundIndex + 1}. szavazás indítása`;
    button.onclick = () => {
  document.body.classList.add("fade-out");
  setTimeout(() => {
    document.body.classList.remove("fade-out");
    document.body.classList.add("fade-in");
    votes();
    setTimeout(() => {
      document.body.classList.remove("fade-in");
    }, 300);
  }, 300);
};

    document.body.appendChild(button);
  }

  //TODO: ez itt
}
let voteResults = []; // küldetésenként újraindítandó
let falseCounter = 0;

function votes() {
  voteResults = [];
  falseCounter = 0;
  currentRoundVoteIndex = 0;
  showVoteScreen();
}

function showVoteScreen() {
  // Ellenőrzés: ha mindenki szavazott, kiértékelés
  const neededVotes = missionSizesByPlayerCount[playerCount][currentRoundIndex];
  if (currentRoundVoteIndex >= neededVotes) {
    let missionFailed = false;

    if (falseCounter === 0 || (falseCounter === 1 && currentRoundIndex === 3 && doubleFailRequired)) {
      missionFailed = false;
    } else {
      missionFailed = true;
    }

    results[currentRoundIndex] = !missionFailed;
    showMissionResultScreen(missionFailed, falseCounter);
    return;
  }

  // Megjelenítés egy szavazónak
  document.body.innerHTML = ``;
  const toptext = document.createElement("h2");
  toptext.innerHTML = `${currentRoundIndex + 1} Küldetés<br>Játékos ${currentRoundVoteIndex + 1}`;
  document.body.appendChild(toptext);
  const succes = document.createElement("button");
  succes.textContent = "Siker";
  succes.onclick = () => vote(true);
  document.body.appendChild(succes);

  const failure = document.createElement("button");
  failure.textContent = "Balsiker";
  failure.onclick = () => vote(false);
  document.body.appendChild(failure);
}

function vote(voteResult) {
  voteResults.push(voteResult);
  if (!voteResult) falseCounter++;
  currentRoundVoteIndex++;

  // Fade out jelenlegi tartalom
  document.body.classList.add("fade-out");

  setTimeout(() => {
    // Tartalom törlése és új betöltése (következő szavazó)
    document.body.classList.remove("fade-out");
    document.body.classList.add("fade-in");

    showVoteScreen();

    // Fade-in után visszavonjuk az osztályt, hogy újrahasználható legyen
    setTimeout(() => {
      document.body.classList.remove("fade-in");
    }, 300);
  }, 300); // ugyanannyi idő, mint a fade-out animáció
}


function showMissionResultScreen(missionFailed, falseCount) {
  document.body.innerHTML = '';

  const header = document.createElement("h2");
  header.textContent = "Küldetés eredménye";
  document.body.appendChild(header);

  const resultText = document.createElement("p");
  resultText.textContent = `Balsikerek száma: ${falseCount}`;
  document.body.appendChild(resultText);

  const outcome = document.createElement("p");
  outcome.textContent = missionFailed ? "❌ A küldetés megbukott!" : "✅ A küldetés sikeres!";
  document.body.appendChild(outcome);

  const nextButton = document.createElement("button");
  nextButton.textContent = "Tovább";
  nextButton.onclick = () => {
  document.body.classList.add("fade-out");
  setTimeout(() => {
    document.body.classList.remove("fade-out");
    document.body.classList.add("fade-in");
    currentRoundIndex++;
    renderMissionBoard(results);
    setTimeout(() => {
      document.body.classList.remove("fade-in");
    }, 300);
  }, 300);
};

  document.body.appendChild(nextButton);
}