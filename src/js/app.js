App = {
  web3Provider: null,
  contracts: {},
  // gobal variable to keep track of the pets that each user has adopted.
  // usersPets: {},
  // TODO: Might be a new contract for tracking the pet that each user has adopted.

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });
    return await App.initWeb3();
  },

  initWeb3: async function() {

    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    web3 = new Web3(App.web3Provider);

    /**
    * Feature: Show current user and balance.
    */
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      const account = accounts[0];
      $('.currUser').text("Current user: " + account);
      web3.eth.getBalance(account, function(error, balance) {
          if (error) {
            console.log(error);
          }
          var currBalance = web3.fromWei(balance.toNumber(), 'Ether')
          $('.currBalance').text("Current balance: " + currBalance + ' ETH')
      });
    });


    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;
    var num_adopted = 0;
    var clients = new Set();

    $('#petsAdoptedNum').text("Total number of pets adopted: " + num_adopted)
    $('#clientsAdoptedNum').text("Total number of clients: " + clients.size)

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      // adopters is adoptionInstance.getAdopters.call()
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          num_adopted++;
          clients.add(adopters[i])
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        web3.eth.getBalance(accounts[0], function(error, balance) {
            if (error) {
              console.log(error);
            }
            var currBalance = web3.fromWei(balance.toNumber(), 'Ether')
            $('.currBalance').text("Current balance: " + currBalance + ' ETH')
        });
      });

      /**
      * Feature 2: Record number of pets adopted, number of clients
      */
      $('#petsAdoptedNum').text("Total number of pets adopted: " + num_adopted)
      $('#clientsAdoptedNum').text("Total number of clients: " + clients.size)
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petNameList = ["Frieda", "Gina", "Collins", "Melissa", "Jeanine", "Elvia",
                       "Latisha", "Coleman", "Nichole", "Fran", "Leonor", "Dean",
                       "Stevenson", "Kristina", "Ethel", "Terry"];

    var petId = parseInt($(event.target).data('id'));
    var petName = petNameList[petId];

    /**
    * Feature 1: Disable button during processing
    *
    */
    // $(this).text('Signing...').attr('disabled', true);
    $('.panel-pet').eq(petId).find('button').text('Signing...').attr('disabled', true);

    // Prevent users from adopting pet if they cannot afford the handling fee (gas fee).
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      web3.eth.getBalance(accounts[0], function(error, balance) {
          if (error) {
            console.log(error);
          }
          var currBalance = web3.fromWei(balance.toNumber(), 'Ether')
          console.log(currBalance);
          if (currBalance==0) {
              $('.noBalance').text("You don't have enough balance for the pet adoption handling fee (please switch account or add more balance).").css("color", "red");
              $('.panel-pet').eq(petId).find('button').text('Adopt').attr('disabled', true);
          }
      });
    });

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
          // Show the name of the pet the user have just adopted.
          $('.alert').text('You have successfully adopted ' + petName + '!');

          return App.markAdopted();
      }).catch(function(err) {
          // Enable button if there is error during processing
          $(this).text('Adopt').removeAttr('disabled');
          console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
