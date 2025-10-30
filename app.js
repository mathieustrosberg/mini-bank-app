// Données de l'application
let clients = [];
let accounts = [];
let transactions = [];

// Générer un ID unique
function genererID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Trouver un client par son ID
function findClient(clientId) {
  for (let i = 0; i < clients.length; i++) {
    if (clients[i].id === clientId) {
      return clients[i];
    }
  }
  return null;
}

// Trouver un compte par son ID
function findAccount(accountId) {
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].id === accountId) {
      return accounts[i];
    }
  }
  return null;
}

// Charger les données depuis le localStorage
function chargerDonnees() {
  let clientsSauvegardes = localStorage.getItem("clients");
  if (clientsSauvegardes) {
    clients = JSON.parse(clientsSauvegardes);
  }

  let comptesSauvegardes = localStorage.getItem("accounts");
  if (comptesSauvegardes) {
    accounts = JSON.parse(comptesSauvegardes);
  }

  let transactionsSauvegardees = localStorage.getItem("transactions");
  if (transactionsSauvegardees) {
    transactions = JSON.parse(transactionsSauvegardees);
  }
}

// Sauvegarder les données dans le localStorage
function sauvegarderDonnees() {
  localStorage.setItem("clients", JSON.stringify(clients));
  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Créer un nouveau client
function createClient(firstName, lastName) {
  if (!firstName || !lastName) {
    throw new Error("Le prénom et le nom sont obligatoires");
  }

  let client = {
    id: genererID(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
  };

  clients.push(client);
  sauvegarderDonnees();
  return client;
}

// Supprimer un client
function deleteClient(clientId) {
  let client = findClient(clientId);
  if (!client) {
    throw new Error("Client introuvable");
  }

  // Vérifier que le client n'a pas de comptes
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].clientId === clientId) {
      throw new Error(
        "Impossible de supprimer : le client a encore des comptes"
      );
    }
  }

  // Supprimer le client
  for (let i = 0; i < clients.length; i++) {
    if (clients[i].id === clientId) {
      clients.splice(i, 1);
      break;
    }
  }

  sauvegarderDonnees();
  return true;
}

// Créer un nouveau compte pour un client
function createAccount(clientId) {
  let client = findClient(clientId);
  if (!client) {
    throw new Error("Client introuvable");
  }

  let account = {
    id: genererID(),
    clientId: clientId,
    balance: 0,
  };

  accounts.push(account);
  sauvegarderDonnees();
  return account;
}

// Supprimer un compte
function deleteAccount(accountId) {
  let account = findAccount(accountId);
  if (!account) {
    throw new Error("Compte introuvable");
  }

  if (account.balance !== 0) {
    throw new Error("Impossible de supprimer : le solde doit être à 0€");
  }

  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].id === accountId) {
      accounts.splice(i, 1);
      break;
    }
  }

  sauvegarderDonnees();
  return true;
}

// Déposer de l'argent
function deposit(accountId, amount) {
  let account = findAccount(accountId);
  if (!account) {
    throw new Error("Compte introuvable");
  }

  if (amount <= 0) {
    throw new Error("Le montant doit être positif");
  }

  account.balance = account.balance + amount;
  sauvegarderDonnees();
}

// Retirer de l'argent
function withdraw(accountId, amount) {
  let account = findAccount(accountId);
  if (!account) {
    throw new Error("Compte introuvable");
  }

  if (amount <= 0) {
    throw new Error("Le montant doit être positif");
  }

  if (account.balance < amount) {
    throw new Error("Solde insuffisant");
  }

  account.balance = account.balance - amount;
  sauvegarderDonnees();
}

// Transférer de l'argent entre deux comptes
function transfer(fromAccountId, toAccountId, amount) {
  let fromAccount = findAccount(fromAccountId);
  let toAccount = findAccount(toAccountId);

  if (!fromAccount) {
    throw new Error("Compte source introuvable");
  }

  if (!toAccount) {
    throw new Error("Compte destination introuvable");
  }

  if (fromAccountId === toAccountId) {
    throw new Error("Impossible de transférer vers le même compte");
  }

  if (amount <= 0) {
    throw new Error("Le montant doit être positif");
  }

  if (fromAccount.balance < amount) {
    throw new Error("Solde insuffisant");
  }

  fromAccount.balance = fromAccount.balance - amount;
  toAccount.balance = toAccount.balance + amount;
  sauvegarderDonnees();
}

// Afficher la liste des clients
function afficherClients() {
  let listeClients = document.getElementById("listeClients");

  if (clients.length === 0) {
    listeClients.innerHTML = "<p>Aucun client enregistré</p>";
    return;
  }

  let html = "";
  for (let i = 0; i < clients.length; i++) {
    html += '<div class="item">';
    html +=
      "<strong>" +
      clients[i].firstName +
      " " +
      clients[i].lastName +
      "</strong><br>";
    html += "ID: " + clients[i].id;
    html += "</div>";
  }

  listeClients.innerHTML = html;
}

// Afficher la liste des comptes
function afficherComptes() {
  let listeComptes = document.getElementById("listeComptes");

  if (accounts.length === 0) {
    listeComptes.innerHTML = "<p>Aucun compte enregistré</p>";
    return;
  }

  let html = "";
  for (let i = 0; i < accounts.length; i++) {
    let account = accounts[i];
    let client = findClient(account.clientId);
    let clientNom = "Client inconnu";

    if (client) {
      clientNom = client.firstName + " " + client.lastName;
    }

    html += '<div class="item">';
    html += "<strong>Compte: " + account.id + "</strong><br>";
    html += "Client: " + clientNom + "<br>";
    html += "Solde: " + account.balance.toFixed(2) + "€";
    html += "</div>";
  }

  listeComptes.innerHTML = html;
}

// Rafraîchir l'interface
function rafraichirInterface() {
  afficherClients();
  afficherComptes();
}

// Formulaire de création de client
document.getElementById("formClient").addEventListener("submit", function (e) {
  e.preventDefault();

  try {
    let prenom = document.getElementById("clientPrenom").value;
    let nom = document.getElementById("clientNom").value;

    let client = createClient(prenom, nom);

    alert("Client cree avec succes!");

    document.getElementById("clientPrenom").value = "";
    document.getElementById("clientNom").value = "";

    rafraichirInterface();
  } catch (error) {
    alert("Erreur: " + error.message);
  }
});

// Formulaire de suppression de client
document
  .getElementById("formSupprimerClient")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    try {
      let clientId = document.getElementById("supprimerClientId").value;
      deleteClient(clientId);

      alert("Client supprime avec succes!");
      document.getElementById("supprimerClientId").value = "";
      rafraichirInterface();
    } catch (error) {
      alert("Erreur: " + error.message);
    }
  });

// Formulaire de création de compte
document.getElementById("formCompte").addEventListener("submit", function (e) {
  e.preventDefault();

  try {
    let clientId = document.getElementById("compteClientId").value;
    createAccount(clientId);

    alert("Compte cree avec succes!");
    document.getElementById("compteClientId").value = "";
    rafraichirInterface();
  } catch (error) {
    alert("Erreur: " + error.message);
  }
});

// Formulaire de dépôt
document.getElementById("formDepot").addEventListener("submit", function (e) {
  e.preventDefault();

  try {
    let compteId = document.getElementById("depotCompteId").value;
    let montant = parseFloat(document.getElementById("depotMontant").value);

    deposit(compteId, montant);

    alert("Depot effectue avec succes!");
    document.getElementById("depotCompteId").value = "";
    document.getElementById("depotMontant").value = "";
    rafraichirInterface();
  } catch (error) {
    alert("Erreur: " + error.message);
  }
});

// Formulaire de retrait
document.getElementById("formRetrait").addEventListener("submit", function (e) {
  e.preventDefault();

  try {
    let compteId = document.getElementById("retraitCompteId").value;
    let montant = parseFloat(document.getElementById("retraitMontant").value);

    withdraw(compteId, montant);

    alert("Retrait effectue avec succes!");
    document.getElementById("retraitCompteId").value = "";
    document.getElementById("retraitMontant").value = "";
    rafraichirInterface();
  } catch (error) {
    alert("Erreur: " + error.message);
  }
});

// Formulaire de transfert
document
  .getElementById("formTransfert")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    try {
      let compteSource = document.getElementById("transfertSource").value;
      let compteDestination = document.getElementById(
        "transfertDestination"
      ).value;
      let montant = parseFloat(
        document.getElementById("transfertMontant").value
      );

      transfer(compteSource, compteDestination, montant);

      alert("Transfert effectue avec succes!");
      document.getElementById("transfertSource").value = "";
      document.getElementById("transfertDestination").value = "";
      document.getElementById("transfertMontant").value = "";
      rafraichirInterface();
    } catch (error) {
      alert("Erreur: " + error.message);
    }
  });

// Formulaire de suppression de compte
document
  .getElementById("formSupprimer")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    try {
      let compteId = document.getElementById("supprimerCompteId").value;
      deleteAccount(compteId);

      alert("Compte supprime avec succes!");
      document.getElementById("supprimerCompteId").value = "";
      rafraichirInterface();
    } catch (error) {
      alert("Erreur: " + error.message);
    }
  });

// Au démarrage de l'application
chargerDonnees();
rafraichirInterface();
