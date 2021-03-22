App = {
    web3Provider: null,
    contracts: {},
    account: 0X0,
    loading: false,

    init: async () => {
        return App.initWeb3();
    },

    initWeb3: async () => {
        if(window.ethereum) {
            window.web3 = new Web3(window.ethereum);

            try {
                await window.ethereum.enable();
                App.displayAccountInfo();
                return App.initContract();

            } catch(error) {
                console.error("Unable to retrieve your accounts! You have to approve this application on Metamask");

            }
        } else if(window.web3) {
            window.web3 = new Web3(web3.currentProvider || "ws://localhost:8545");
            App.displayAccountInfo();
            return App.initContract();

        } else {
            console.log("Non-ethereum browser detected. You should consider trying Metamask");

        }
    },

    displayAccountInfo: async () => {

        const accounts = await window.web3.eth.getAccounts();
        App.account = accounts[0];

        $('#account').text(App.account);

        const balance = await window.web3.eth.getBalance(App.account);
        $('#accountBalance').text(window.web3.utils.fromWei(balance, "ether") + " ETH");
    },

    initContract: async () => {
        $.getJSON('BlockChainDM.json', chainListArtifact => {
            App.contracts.BlockChainDM = TruffleContract(chainListArtifact);
            App.contracts.BlockChainDM.setProvider(window.web3.currentProvider);
            return App.reloadData();

        });
    },

    sellData: async () => {
        const dataPriceValue = parseFloat($('#data_price').val());
        const dataPrice = isNaN(dataPriceValue) ? "0" : dataPriceValue.toString();

        const _name = $('#data_name').val();

        const _content = $('#data_content').val();

        const _price = window.web3.utils.toWei(dataPrice, "ether");

        if(_name.trim() == "") {
            return false;

        }
        try {
            const dataInstance = await App.contracts.BlockChainDM.deployed();

            const transactionReceipt = await dataInstance.sellData(
                _name,
                _content,
                _price,
                {from: App.account, gas: 5000000}

            ).on("transactionHash", hash => {
                console.log("transaction hash", hash);

            });
            console.log("transaction receipt", transactionReceipt);
            App.reloadData();

        } catch(error) {
            console.error(error);

        }
    },

    buyData: async () => {
        event.preventDefault();

        var _dataId = $(event.target).data('id');

        const dataPriceValue = parseFloat($(event.target).data('value'));
        const dataPrice = isNaN(dataPriceValue) ? "0" : dataPriceValue.toString();
        const _price = window.web3.utils.toWei(dataPrice, "ether");

        try {
            const dataInstance = await App.contracts.BlockChainDM.deployed();
            const sellableData = await dataInstance.data(_dataId);

            const transactionReceipt = await dataInstance.buyData(
                _dataId, {
                    from: App.account,
                    value: _price,
                    gas: 500000
                }

            ).on("transactionHash", hash => {
                console.log("transaction hash", hash);

            });
            console.log("transaction receipt", transactionReceipt);

            generatePDF(sellableData[3],sellableData[4]);

            App.reloadData();

        } catch(error) {
            console.error(error);

        }
    },

    reloadData: async () => {
        if (App.loading) {
            return;
        }

        App.loading = true;

        App.displayAccountInfo();

        try {
            const dataInstance = await App.contracts.BlockChainDM.deployed();
            const dataIds = await dataInstance.getIdsForData();
            $('#dataRow').empty();

            for(let i = 0; i < dataIds.length; i++) {
                const data = await dataInstance.data(dataIds[i]);
                App.displayData(data[0], data[1], data[3], data[4], data[5]);
            }

            App.loading = false;

        } catch(error) {
            console.error(error);
            App.loading = false;
        }
    },

    searchData: async (option) => {

        if (App.loading) {
          return;
        }

        App.loading = true;

        App.displayAccountInfo();

        const value = $('#enteredValue').val();

        const allData = new Array();

        const dataInstance = await App.contracts.BlockChainDM.deployed();
        const dataIds = await dataInstance.getIdsForData();

        $('#dataRow').empty();

        for(let i = 0; i < dataIds.length; i++) {
            const data = await dataInstance.data(dataIds[i]);
            allData.push(data);

        }

        let results = [];

        if(option === 'search'){
          results= allData.filter(match => match[3].includes(value));

        } else if(option === "yourData"){
          results= allData.filter(match => match[1] == App.account);

        } else if(option === "othersData"){
          results= allData.filter(match => match[1] != App.account);

        }

        results.forEach(data => App.displayData(data[0], data[1], data[3], data[4], data[5]));

        App.loading = false;

    },

    displayData: (id, seller, name, content, price) => {
        const dataRow = $('#dataRow');
        const etherPrice = web3.utils.fromWei(price, "ether");

        var dataTemplate = $('#dataTemplate')
        dataTemplate.find('.panel-title').text(name);
        dataTemplate.find('.data-content').text(content);
        dataTemplate.find('.data-price').text(etherPrice + " ETH");
        dataTemplate.find('.btn-buy').attr('data-id', id);
        dataTemplate.find('.btn-buy').attr('data-value', etherPrice);

        if (seller == App.account) {
            dataTemplate.find('.data-content').text(content);
            dataTemplate.find('.data-seller').text("You");
            dataTemplate.find('.btn-buy').hide();
            dataTemplate.find('.btn-content').show();

        } else {
            dataTemplate.find('.data-content').text("Encrypted");
            dataTemplate.find('.data-seller').text(seller);
            dataTemplate.find('.btn-buy').show();
            dataTemplate.find('.btn-content').hide();

        }

        dataRow.append(dataTemplate.html());
    },
};

function generatePDF(name, content){
  const doc = new jsPDF();
  const pdfName = name.concat(".pdf");

  var splitTitle = doc.splitTextToSize(content, 270);
  var pageHeight = doc.internal.pageSize.height;

  doc.setFontType("normal");
  doc.setFontSize("12");

  var y = 7;

  for (var i = 0; i < splitTitle.length; i++) {
    if (y > 280) {
       y = 10;
       doc.addPage();

    }
       doc.text(5, y, splitTitle[i]);
       y = y + 7;

  }

   doc.save(pdfName);
}

$(function () {
    $(window).load(function () {
        App.init();
    });
});
