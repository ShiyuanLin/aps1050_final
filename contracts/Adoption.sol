pragma solidity ^0.5.0;

contract Adoption {
	address[16] public adopters;

	// Adopting a pet
	function adopt(uint petId) public returns (uint) {
	  require(petId >= 0 && petId <= 15);

	  adopters[petId] = msg.sender;

	  return petId;
	}

	// Retrieving the adopters
	function getAdopters() public view returns (address[16] memory) {
	  return adopters;
	}

	// Contract for the new voting feature.
	// Model a Candidate
	struct Candidate {
		uint id;
		string name;
		uint voteCount;
	}

	// Store accounts that have voted
	mapping(address => bool) public voters;
	// Store Candidates
	// Fetch Candidate
	mapping(uint => Candidate) public candidates;
	// Store Candidates Count
	uint public candidatesCount;

	// voted event
	event votedEvent (
		uint indexed _candidateId
	);

	constructor () public {
		addCandidate("Frieda");
		addCandidate("Gina");
		addCandidate("Collins");
		addCandidate("Melissa");
		addCandidate("Jeanine");
		addCandidate("Elvia");
		addCandidate("Latisha");
		addCandidate("Coleman");
		addCandidate("Nichole");
		addCandidate("Fran");
		addCandidate("Leonor");
		addCandidate("Dean");
		addCandidate("Stevenson");
		addCandidate("Kristina");
		addCandidate("Ethel");
		addCandidate("Terry");
	}

	function addCandidate (string memory _name) private {
		candidatesCount ++;
		candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
	}

	function vote (uint _candidateId) public {
		// require that they haven't voted before
		require(!voters[msg.sender]);

		// require a valid candidate
		require(_candidateId > 0 && _candidateId <= candidatesCount);

		// record that voter has voted
		voters[msg.sender] = true;

		// update candidate vote Count
		candidates[_candidateId].voteCount ++;

		// trigger voted event
		emit votedEvent(_candidateId);
	}
}
