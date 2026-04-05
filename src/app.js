
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
    // return /Android|iPhone/i.test(navigator.userAgent);
    return window.innerWidth < 900;
    // return false
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

async function connectClicked(showConnect) {
    let wpd = document.getElementById("wallet_place_d")
    let wpm = document.getElementById("wallet_place_m")
    let wad = document.getElementById("wallet_arrow_d")
    let wam = document.getElementById("wallet_arrow_m")

    if (showConnect) {
        if (isMobile()) {
            wpm.setAttribute("onclick", "connectClicked(false)")
            document.getElementById("disconnect_button_m").style.display = "none"
            document.getElementById("wallet_overlay_m").style.display = "flex";
            wam.style.transform = "rotate(90deg)";
            document.getElementById("overlay-title-m").innerText = "Select Wallet";
        } else {
            wpd.setAttribute("onclick", "connectClicked(false)")
            // document.getElementById("wallet_overlay_d").style.display = "flex";
        }

    } else {
        wpd.setAttribute("onclick", "connectClicked(true)")
        wpm.setAttribute("onclick", "connectClicked(true)")
        document.getElementById("wallet_overlay_m").style.display = "none";
        document.getElementById("wallet_overlay_d").style.display = "none";
        wam.style.transform = "rotate(0deg)";
    }
}


async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        signer = null;
        contract = null;
        return;
    }
    const address = accounts[0];
    let wallet = `<div>${medAddress(address)}</div>`;

    if (isMobile()) {
        document.getElementById("wallet_place_m").setAttribute("onclick", "showWallets()")
        document.getElementById("account_list_m").innerHTML = wallet;
        document.getElementById("wallet_arrow_m").style.display = "flex"
        document.getElementById("wallet_list_m").style.display = "none";
    } else {
        document.getElementById("wallet_place_d").setAttribute("onclick", "showWallets()")
        document.getElementById("account_list_d").innerHTML = wallet;
        document.getElementById("disconnect_button_d").style.display = "flex"
        document.getElementById("account_list_d").innerHTML = wallet;
        document.getElementById("wallet_arrow_d").style.display = "flex"
        document.getElementById("wallet_list_d").style.display = "none";
    }
    signer = await provider.getSigner();
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

    try {
        // Only check connection, DO NOT request
        const accounts = await provider.send("eth_accounts", []);

        if (accounts.length > 0) {
            localStorage.setItem("walletConnected", "true");
            await handleAccountsChanged(accounts);
        } else {
            showConnectButton();
        }
    } catch (e) {
        showConnectButton();
    }
};


async function connectWallet(walletName) {
    const dappUrl = window.location.href;
    const encodedUrl = encodeURIComponent(dappUrl);
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
    } else if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        localStorage.setItem("walletConnected", "true");


        const signer = await provider.getSigner();
        address = await signer.getAddress();
        await handleAccountsChanged(accounts)
    } else {
        alert("Install MetaMask, TrustWallet or Coinbase Wallet Extension");
    }
}

async function onWalletConnected(account, index) {
    document.getElementById("tbyt_balance").innerText = tbyt + " TBYT";
    document.getElementById("pol_balance").innerText = pol + " POL";
    document.getElementById("usdt_balance").innerText = usdt + " USDT";
    if (isMobile()) {
        document.getElementById("wallet_place_m").setAttribute("onclick", "showWallets()");
        document.getElementById("wallet_arrow_m").style.display = "flex";
        document.getElementById("walletAddress_m").innerText = shortAddress(account[index], isMobile);
    } else {
        console.log("j");

        document.getElementById("wallet_place_d").setAttribute("onclick", "showWallets()");
        document.getElementById("wallet_arrow_d").style.display = "flex";
        document.getElementById("walletAddress_d").innerText = medAddress(account[index]);
    }
}

function showConnectButton() {
    document.getElementById("walletAddress_d").innerText = "Connect Wallet";
    document.getElementById("walletAddress_m").innerText = "Connect";
}

let showWallet = false;
async function showWallets() {
    document.getElementById("wallet_list_m").style.display = "none"
    if (!showWallet) {
        if (isMobile()) {
            document.getElementById("wallet_overlay_m").style.display = "flex";
            document.getElementById("wallet_overlay_d").style.display = "none";
        } else {
            document.getElementById("wallet_overlay_d").style.display = "flex";
            document.getElementById("wallet_overlay_m").style.display = "none";
            document.getElementById("disconnect_button_d").style.display = "flex"

        }

        document.getElementById("wallet_arrow_d").style.transform = "rotate(90deg)";
        document.getElementById("wallet_arrow_m").style.transform = "rotate(90deg)";
        showWallet = true;
    } else {
        document.getElementById("wallet_overlay_d").style.display = "none";
        document.getElementById("wallet_overlay_m").style.display = "none";

        document.getElementById("wallet_arrow_d").style.transform = "rotate(0deg)";
        document.getElementById("wallet_arrow_m").style.transform = "rotate(0deg)";

        showWallet = false;
    }
}

function disconnectWallet() {
    signer = null;
    contract = null;
    walletConnection = false;
    localStorage.removeItem("walletConnected");
    showConnectButton()
    document.getElementById("tbyt_balance").innerText = "0.00 TBYT";
    document.getElementById("pol_balance").innerText = "0.00 POL";
    document.getElementById("usdt_balance").innerText = "0.00 USDT";
    document.getElementById("wallet_overlay_d").style.display = "none";
    document.getElementById("wallet_overlay_m").style.display = "none";
    document.getElementById("wallet_list_m").style.display = "flex"
    document.getElementById("account_list_m").style.display = "none"
    document.getElementById("account_list_d").style.display = "none"
    document.getElementById("wallet_list_m").style.flexDirection = "column"
    document.getElementById("wallet_arrow_d").style.rotate = "calc(90deg)";
    document.getElementById("wallet_arrow_d").style.display = "none";
    document.getElementById("wallet_arrow_m").style.rotate = "calc(90deg)";
    document.getElementById("wallet_place_d").setAttribute("onclick", "connectWallet(true)");
    document.getElementById("wallet_place_m").setAttribute("onclick", "connectClicked(true)");
}