
let provider;
let signer;
let contract;
let contractUSDT;
let abi;
let walletConnection = false;
let tbyt;
let usdt;
let pol;
function isMobile() {
    return /Android|iPhone/i.test(navigator.userAgent);
}
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

    document.getElementById("account_list_1").innerHTML = wallets;
    document.getElementById("account_list_2").innerHTML = wallets;

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

async function connectClicked(showConnect) {
    let wo1 = document.getElementById("wallet_place_1")
    let wo2 = document.getElementById("wallet_place_2")
    document.getElementById("account_list_2").style.display = "none"
    if (showConnect) {
        wo1.setAttribute("onclick", "connectClicked(false)")
        wo2.setAttribute("onclick", "connectClicked(false)")
        document.getElementById("disconnect_button_1").style.display = "none"
        document.getElementById("disconnect_button_2").style.display = "none"
        document.getElementById("wallet_overlay_2").style.display = "flex";
        document.getElementById("overlay-title-2").innerText = "Select Wallet";

        document.getElementById("wallet_arrow1").style.transform = "rotate(90deg)";
        document.getElementById("wallet_arrow2").style.transform = "rotate(90deg)";
    } else {
        wo1.setAttribute("onclick", "connectClicked(true)")
        document.getElementById("wallet_overlay_2").style.display = "none";
        document.getElementById("wallet_overlay_1").style.display = "none";

        document.getElementById("wallet_arrow1").style.transform = "rotate(0deg)";
        document.getElementById("wallet_arrow2").style.transform = "rotate(0deg)";
    }

}
async function waitForEthereum() {
    return new Promise((resolve) => {
        if (window.ethereum) return resolve(window.ethereum);

        const checkInterval = setInterval(() => {
            if (window.ethereum) {
                clearInterval(checkInterval);
                resolve(window.ethereum);
            }
        }, 300);
    });
}



window.onload = async function () {

    const eth = await waitForEthereum();
    provider = new ethers.BrowserProvider(eth);

    await loadABI();

    const accounts = await provider.send("eth_accounts", []);

    if (accounts.length > 0) {
        await handleAccountsChanged(accounts);
    } else {
        showConnectButton();
    }
};
async function connectWallet(walletName) {
    const dappUrl = window.location.href;
    const encodedUrl = encodeURIComponent(dappUrl);

    // If already inside wallet browser → connect
    if (window.ethereum) {
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        return;
    }

    // Mobile deep links
    if (isMobile()) {
        if (walletName == "metamask") {
            window.location.href =
                "https://metamask.app.link/dapp/" + dappUrl.replace("https://", "");
            if (window.ethereum) {
                await provider.send("eth_requestAccounts", []);
                signer = await provider.getSigner();

                localStorage.setItem("walletConnected", "true"); // ADD THIS
                return;
            }
        }
        else if (walletName == "coinbase") {
            window.location.href =
                "https://go.cb-w.com/dapp?cb_url=" + encodedUrl;

            if (window.ethereum) {
                await provider.send("eth_requestAccounts", []);
                signer = await provider.getSigner();

                localStorage.setItem("walletConnected", "true"); // ADD THIS
                return;
            }
        }
        else if (walletName == "trustwallet") {
            window.location.href =
                "https://link.trustwallet.com/open_url?coin_id=60&url=" + encodedUrl;
            if (window.ethereum) {
                await provider.send("eth_requestAccounts", []);
                signer = await provider.getSigner();

                localStorage.setItem("walletConnected", "true"); // ADD THIS
                return;
            }
        }
        return;
    }

    // Desktop
    if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        console.log("Connected:", address);
    } else {
        alert("Install MetaMask, TrustWallet or Coinbase Wallet Extension");
    }
}

function shortAddress(address, isMobile) {
    if (isMobile) {
        return address.slice(0, 4) + "..." + address.slice(-4);
    } else {
        return address.slice(0, 6) + "....." + address.slice(-4);
    }

}

function medAddress(address) {
    return address.slice(0, 8) + "....." + address.slice(-8);
}
async function onWalletConnected(account, index) {
    document.getElementById("walletAddress1").innerText = shortAddress(account[index], isMobile);
    document.getElementById("walletAddress2").innerText = shortAddress(account[index], isMobile);

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
    }
}

function showConnectButton() {
    document.getElementById("walletAddress1").innerText = "Connect";
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