
let provider;
let signer;
let contract;
let contractUSDT;
let abi;
let walletConnection = false;
let tbyt;
let usdt;
let pol;

const contractAddress = "0x1dA548b17Fdd43384f2Abe0932d6365cb4bABAaa";
const usdtAddress = "0xbb681A3429e3db53DD51824aaCe4F5bB85B0c54d"
const usdtAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
];
if (window.ethereum) {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => location.reload());
}

async function loadABI() {
    const response = await fetch("./src/abi.json");   // your ABI file
    const json = await response.json();
    abi = json.abi;              // must be JSON array
}

async function loadERCABI() {
    const response = await fetch("./src/erc.json");   // your ABI file
    const json = await response.json();
    usdtabi = json.abi;              // must be JSON array
}

window.onload = async function () {
    if (!window.ethereum) {
        alert("Install MetaMask");
        return;
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    await loadABI();

    const wasConnected = localStorage.getItem("walletConnected");
    walletConnection = wasConnected;
    if (!wasConnected) {
        showConnectButton();
        return;
    }

    const accounts = await provider.send("eth_accounts", []);

    if (accounts.length > 0) {
        await handleAccountsChanged(accounts);
    } else {
        showConnectButton();
    }
};
function formatNumberShort(num) {
    num = parseFloat(num);

    if (num >= 1e9) {
        return (num / 1e9).toFixed(2).replace(/\.00$/, '') + "B";
    }
    if (num >= 1e6) {
        return (num / 1e6).toFixed(2).replace(/\.00$/, '') + "M";
    }
    if (num >= 1e3) {
        return (num / 1e3).toFixed(2).replace(/\.00$/, '') + "K";
    }
    return num.toString();
}
function formatUnits(value, decimals = 18, maxDecimals = 4) {
    value = value.toString();

    if (value.length <= decimals) {
        value = value.padStart(decimals + 1, '0');
    }

    let integerPart = value.slice(0, value.length - decimals);
    let decimalPart = value.slice(value.length - decimals);

    decimalPart = decimalPart.replace(/0+$/, '');
    decimalPart = decimalPart.slice(0, maxDecimals);

    let longer = decimalPart ? integerPart + "." + decimalPart : integerPart;
    return formatNumberShort(longer);
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        signer = null;
        contract = null;
        return;
    }

    let wallets = ``;
    for (let i = 1; i < accounts.length; i++) {
        wallets += `<div>${medAddress(accounts[i])}</div>`;
    }

    document.getElementById("wallet_list_1").innerHTML = wallets;
    document.getElementById("wallet_list_2").innerHTML = wallets;

    signer = await provider.getSigner();
    const address = accounts[0];

    contract = new ethers.Contract(contractAddress, abi, signer);
    contractUSDT = new ethers.Contract(usdtAddress, usdtAbi, signer);

    pol = await provider.getBalance(address);
    tbyt = await contract.balanceOf(address);
    usdt = await contractUSDT.balanceOf(address);

    pol = formatUnits(pol, 18);
    tbyt = formatUnits(tbyt, 8);
    usdt = formatUnits(usdt, 8);

    onWalletConnected(accounts, 0);
}

async function connectWallet(place) {
    const accounts = await provider.send("eth_requestAccounts", []);

    localStorage.setItem("walletConnected", "true");

    await handleAccountsChanged(accounts, place);
}

function shortAddress(address) {
    return address.slice(0, 6) + "....." + address.slice(-4);
}

function medAddress(address) {
    return address.slice(0, 8) + "....." + address.slice(-8);
}
async function onWalletConnected(account, index) {
    document.getElementById("walletAddress1").innerText = shortAddress(account[index]);
    document.getElementById("walletAddress2").innerText = shortAddress(account[index]);

    document.getElementById("tbyt_balance").innerText = tbyt + " TBYT";
    document.getElementById("pol_balance").innerText = pol + " POL";
    document.getElementById("usdt_balance").innerText = usdt + " USDT";
    if (account.length > 1) {
        document.getElementById("wallet_place_1").setAttribute("onclick", "showWallets()");
        document.getElementById("wallet_place_2").setAttribute("onclick", "showWallets()");
        document.getElementById("wallet_arrow1").style.display = "flex";
        document.getElementById("wallet_arrow2").style.display = "flex";
    } else {
        document.getElementById("wallet_arrow1").style.display = "none";
        document.getElementById("wallet_arrow2").style.display = "none";
    }
}

function showConnectButton() {
    document.getElementById("walletAddress1").innerText = "Connect Wallet";
    document.getElementById("walletAddress2").innerText = "Connect Wallet";
}

let showWallet = false;
async function showWallets() {
    const isMobile = window.innerWidth < 990;
    if (!showWallet) {
        if (isMobile) {
            document.getElementById("wallet_overlay_1").style.display = "none";
            document.getElementById("wallet_overlay_2").style.display = "flex";
        } else {
            document.getElementById("wallet_overlay_1").style.display = "flex";
            document.getElementById("wallet_overlay_2").style.display = "none";
        }

        document.getElementById("wallet_arrow1").style.transform = "rotate(90deg)";
        document.getElementById("wallet_arrow2").style.transform = "rotate(90deg)";

        showWallet = true;
    } else {
        document.getElementById("wallet_overlay_1").style.display = "none";
        document.getElementById("wallet_overlay_2").style.display = "none";

        document.getElementById("wallet_arrow1").style.transform = "rotate(0deg)";
        document.getElementById("wallet_arrow2").style.transform = "rotate(0deg)";

        showWallet = false;
    }
}

function disconnectWallet() {
    signer = null;
    contract = null;
    walletConnection = false;
    localStorage.removeItem("walletConnected");
    showConnectButton()
    usdt = 0.00;
    pol = 0.00;
    tbyt = 0.00;
    document.getElementById("wallet_overlay_1").style.display = "none";
    document.getElementById("wallet_overlay_2").style.display = "none";
    document.getElementById("wallet_arrow1").style.rotate = "calc(90deg)";
    document.getElementById("wallet_arrow2").style.rotate = "calc(90deg)";
    document.getElementById("wallet_arrow1").style.display = "none";
    document.getElementById("wallet_arrow2").style.display = "none";
    document.getElementById("wallet_place_1").setAttribute("onclick", "connectWallet()");
    document.getElementById("wallet_place_2").setAttribute("onclick", "connectWallet()");
}