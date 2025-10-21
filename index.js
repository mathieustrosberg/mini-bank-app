// Import du module crypto pour générer des UUIDs
import { randomUUID } from 'crypto';

// Structures de données
let clients = []; 
let accounts = []; 
let transactions = []; 


// ===== FONCTIONS UTILITAIRES =====

function isValidAmount(amount) {
    return typeof amount === 'number' && amount > 0;
}

function clientExists(clientId) {
    return clients.some(client => client.id === clientId);
}

function accountExists(accountId) {
    return accounts.some(account => account.id === accountId);
}

// Vérifier qu'un compte appartient à un client
function accountBelongsToClient(accountId, clientId) {
    const account = accounts.find(account => account.id === accountId);
    return account && account.clientId === clientId;
}

function hasSufficientFunds(accountId, amount) {
    const account = accounts.find(account => account.id === accountId);
    return account && account.balance >= amount;
}

function findClient(clientId) {
    return clients.find(client => client.id === clientId);
}

function findAccount(accountId) {
    return accounts.find(account => account.id === accountId);
}

// ===== GESTION DES CLIENTS =====

function createClient(firstName, lastName) {
    // Validation des données
    if (!firstName || !lastName || typeof firstName !== 'string' || typeof lastName !== 'string') {
        throw new Error("Le prénom et le nom doivent être des chaînes de caractères non vides");
    }
    
    // Création du client avec ID généré automatiquement
    const client = {
        id: randomUUID(),
        firstName: firstName.trim(),
        lastName: lastName.trim()
    };
    
    clients.push(client);
    
    console.log(`Client créé avec succès : ${client.firstName} ${client.lastName} (ID: ${client.id})`);
    return client;
}

// Récupérer un client par son ID
function getClient(clientId) {
    const client = findClient(clientId);
    if (!client) {
        throw new Error(`Client avec l'ID ${clientId} introuvable`);
    }
    return client;
}

// Récupérer tous les clients
function getAllClients() {
    return clients;
}

// ===== GESTION DES COMPTES =====

function createAccount(clientId) {
    if (!clientExists(clientId)) {
        throw new Error(`Client avec l'ID ${clientId} introuvable`);
    }
    
    // Création du compte avec ID généré automatiquement
    const account = {
        id: randomUUID(),
        clientId: clientId,
        balance: 0
    };
    
    // Ajout à la liste des comptes
    accounts.push(account);
    
    const client = getClient(clientId);
    console.log(`Compte créé avec succès pour ${client.firstName} ${client.lastName} (ID compte: ${account.id})`);
    return account;
}

function getAccount(accountId) {
    const account = findAccount(accountId);
    if (!account) {
        throw new Error(`Compte avec l'ID ${accountId} introuvable`);
    }
    return account;
}

// Récupérer tous les comptes d'un client
function getAccountsByClient(clientId) {
    if (!clientExists(clientId)) {
        throw new Error(`Client avec l'ID ${clientId} introuvable`);
    }
    
    return accounts.filter(account => account.clientId === clientId);
}

// Supprimer un compte (seulement si le solde est à 0)
function deleteAccount(accountId) {
    const account = getAccount(accountId);
    
    if (account.balance !== 0) {
        throw new Error(`Impossible de supprimer le compte ${accountId} : le solde n'est pas à zéro (${account.balance}€)`);
    }
    
    // Suppression du compte
    const index = accounts.findIndex(acc => acc.id === accountId);
    accounts.splice(index, 1);
    
    console.log(`Compte ${accountId} supprimé avec succès`);
    return true;
}

// ===== OPÉRATIONS BANCAIRES =====

function createTransaction(type, amount, accountId) {
    const transaction = {
        id: randomUUID(),
        type: type,
        amount: amount,
        date: new Date().toISOString(),
        accountId: accountId
    };
    
    transactions.push(transaction);
    return transaction;
}

function deposit(accountId, amount) {
    // Validation
    if (!accountExists(accountId)) {
        throw new Error(`Compte avec l'ID ${accountId} introuvable`);
    }
    
    if (!isValidAmount(amount)) {
        throw new Error("Le montant doit être un nombre positif");
    }
    
    // Mise à jour du solde
    const account = findAccount(accountId);
    account.balance += amount;
    
    // Création de la transaction
    const transaction = createTransaction("deposit", amount, accountId);
    
    console.log(`Dépôt de ${amount}€ effectué sur le compte ${accountId}. Nouveau solde: ${account.balance}€`);
    return transaction;
}

// Retrait d'argent d'un compte
function withdraw(accountId, amount) {
    // Validation
    if (!accountExists(accountId)) {
        throw new Error(`Compte avec l'ID ${accountId} introuvable`);
    }
    
    if (!isValidAmount(amount)) {
        throw new Error("Le montant doit être un nombre positif");
    }
    
    if (!hasSufficientFunds(accountId, amount)) {
        const account = findAccount(accountId);
        throw new Error(`Solde insuffisant. Solde actuel: ${account.balance}€, montant demandé: ${amount}€`);
    }
    

    const account = findAccount(accountId);
    account.balance -= amount;
    
    // Création de la transaction
    const transaction = createTransaction("withdrawal", amount, accountId);
    
    console.log(`Retrait de ${amount}€ effectué du compte ${accountId}. Nouveau solde: ${account.balance}€`);
    return transaction;
}

function transfer(fromAccountId, toAccountId, amount) {
    // Validation
    if (!accountExists(fromAccountId)) {
        throw new Error(`Compte source avec l'ID ${fromAccountId} introuvable`);
    }
    
    if (!accountExists(toAccountId)) {
        throw new Error(`Compte destination avec l'ID ${toAccountId} introuvable`);
    }
    
    if (fromAccountId === toAccountId) {
        throw new Error("Impossible de transférer vers le même compte");
    }
    
    if (!isValidAmount(amount)) {
        throw new Error("Le montant doit être un nombre positif");
    }
    
    if (!hasSufficientFunds(fromAccountId, amount)) {
        const account = findAccount(fromAccountId);
        throw new Error(`Solde insuffisant. Solde actuel: ${account.balance}€, montant demandé: ${amount}€`);
    }
    
    // Mise à jour des soldes
    const fromAccount = findAccount(fromAccountId);
    const toAccount = findAccount(toAccountId);
    
    fromAccount.balance -= amount;
    toAccount.balance += amount;
    
    // Création des transactions (une pour chaque compte)
    const withdrawalTransaction = createTransaction("withdrawal", amount, fromAccountId);
    const depositTransaction = createTransaction("deposit", amount, toAccountId);
    
    console.log(`Transfert de ${amount}€ du compte ${fromAccountId} vers le compte ${toAccountId}`);
    console.log(`Compte source: ${fromAccount.balance}€, Compte destination: ${toAccount.balance}€`);
    
    return { withdrawalTransaction, depositTransaction };
}

// ===== FONCTIONS D'AFFICHAGE ET CONSULTATION =====

// Afficher le solde d'un compte
function getAccountBalance(accountId) {
    const account = getAccount(accountId);
    console.log(`Solde du compte ${accountId}: ${account.balance}€`);
    return account.balance;
}

// Afficher l'historique des transactions d'un compte
function getAccountHistory(accountId) {
    if (!accountExists(accountId)) {
        throw new Error(`Compte avec l'ID ${accountId} introuvable`);
    }
    
    const accountTransactions = transactions.filter(transaction => transaction.accountId === accountId);
    
    console.log(`\nHistorique du compte ${accountId}:`);
    if (accountTransactions.length === 0) {
        console.log("Aucune transaction");
    } else {
        accountTransactions.forEach(transaction => {
            console.log(`${transaction.date} - ${transaction.type}: ${transaction.amount}€`);
        });
    }
    
    return accountTransactions;
}

// Afficher l'argent total d'un client (tous comptes confondus)
function getClientTotalBalance(clientId) {
    if (!clientExists(clientId)) {
        throw new Error(`Client avec l'ID ${clientId} introuvable`);
    }
    
    const clientAccounts = getAccountsByClient(clientId);
    const totalBalance = clientAccounts.reduce((total, account) => total + account.balance, 0);
    
    const client = getClient(clientId);
    console.log(`Total pour ${client.firstName} ${client.lastName}: ${totalBalance}€`);
    return totalBalance;
}

// Afficher l'argent total de la banque (tous clients confondus)
function getBankTotalBalance() {
    const totalBalance = accounts.reduce((total, account) => total + account.balance, 0);
    console.log(`Total de la banque: ${totalBalance}€`);
    return totalBalance;
}

// Afficher tous les clients avec leurs IDs
function listAllClients() {
    console.log("\n=== LISTE DES CLIENTS ===");
    if (clients.length === 0) {
        console.log("Aucun client enregistré");
    } else {
        clients.forEach((client, index) => {
            console.log(`${index + 1}. ${client.firstName} ${client.lastName} (ID: ${client.id})`);
        });
    }
    console.log("========================");
}

// Afficher tous les comptes d'un client
function listClientAccounts(clientId) {
    if (!clientExists(clientId)) {
        throw new Error(`Client avec l'ID ${clientId} introuvable`);
    }
    
    const client = getClient(clientId);
    const clientAccounts = getAccountsByClient(clientId);
    
    console.log(`\n=== COMPTES DE ${client.firstName.toUpperCase()} ${client.lastName.toUpperCase()} ===`);
    if (clientAccounts.length === 0) {
        console.log("Aucun compte pour ce client");
    } else {
        clientAccounts.forEach((account, index) => {
            console.log(`${index + 1}. Compte ID: ${account.id} - Solde: ${account.balance}€`);
        });
    }
    console.log("==========================================");
}

// ===== MENU PRINCIPAL =====

import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

function displayMenu() {
    console.log("\n=== MINI-BANK-APP ===");
    console.log("1. Créer un client");
    console.log("2. Créer un compte");
    console.log("3. Dépôt d'argent");
    console.log("4. Retrait d'argent");
    console.log("5. Transfert d'argent");
    console.log("6. Afficher le solde d'un compte");
    console.log("7. Afficher l'historique d'un compte");
    console.log("8. Afficher le total d'un client");
    console.log("9. Afficher le total de la banque");
    console.log("10. Supprimer un compte");
    console.log("11. Lister tous les clients");
    console.log("12. Lister les comptes d'un client");
    console.log("0. Quitter");
    console.log("==================");
}

async function mainMenu() {
    console.log("Mini-bank initialisée !");
    
    while (true) {
        displayMenu();
        const choice = await askQuestion("Choisissez une option (0-12): ");
        
        try {
            switch (choice) {
                case "1":
                    await createClientMenu();
                    break;
                case "2":
                    await createAccountMenu();
                    break;
                case "3":
                    await depositMenu();
                    break;
                case "4":
                    await withdrawMenu();
                    break;
                case "5":
                    await transferMenu();
                    break;
                case "6":
                    await balanceMenu();
                    break;
                case "7":
                    await historyMenu();
                    break;
                case "8":
                    await clientTotalMenu();
                    break;
                case "9":
                    getBankTotalBalance();
                    break;
                case "10":
                    await deleteAccountMenu();
                    break;
                case "11":
                    listAllClients();
                    break;
                case "12":
                    await listClientAccountsMenu();
                    break;
                case "0":
                    console.log("Au revoir !");
                    rl.close();
                    return;
                default:
                    console.log("Option invalide. Veuillez choisir entre 0 et 12.");
            }
        } catch (error) {
            console.error("Erreur :", error.message);
        }
        
        await askQuestion("\nAppuyez sur Entrée pour continuer...");
    }
}

// Fonctions pour chaque menu
async function createClientMenu() {
    const firstName = await askQuestion("Prénom du client: ");
    const lastName = await askQuestion("Nom du client: ");
    createClient(firstName, lastName);
}

async function createAccountMenu() {
    const clientId = await askQuestion("ID du client: ");
    createAccount(clientId);
}

async function depositMenu() {
    const accountId = await askQuestion("ID du compte: ");
    const amount = parseFloat(await askQuestion("Montant à déposer: "));
    deposit(accountId, amount);
}

async function withdrawMenu() {
    const accountId = await askQuestion("ID du compte: ");
    const amount = parseFloat(await askQuestion("Montant à retirer: "));
    withdraw(accountId, amount);
}

async function transferMenu() {
    const fromAccountId = await askQuestion("ID du compte source: ");
    const toAccountId = await askQuestion("ID du compte destination: ");
    const amount = parseFloat(await askQuestion("Montant à transférer: "));
    transfer(fromAccountId, toAccountId, amount);
}

async function balanceMenu() {
    const accountId = await askQuestion("ID du compte: ");
    getAccountBalance(accountId);
}

async function historyMenu() {
    const accountId = await askQuestion("ID du compte: ");
    getAccountHistory(accountId);
}

async function clientTotalMenu() {
    const clientId = await askQuestion("ID du client: ");
    getClientTotalBalance(clientId);
}

async function deleteAccountMenu() {
    const accountId = await askQuestion("ID du compte à supprimer: ");
    deleteAccount(accountId);
}

async function listClientAccountsMenu() {
    const clientId = await askQuestion("ID du client: ");
    listClientAccounts(clientId);
}

// Démarrer l'application
mainMenu().catch(console.error);
