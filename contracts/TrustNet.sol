// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TrustNet is Ownable, ReentrancyGuard, Pausable {
    struct UserProfile {
        string name;
        string ipfsHash;
        uint256 overallScore;
        uint256 financialScore;
        uint256 professionalScore;
        uint256 socialScore;
        bool isActive;
        uint256 lastUpdated;
    }

    struct Reference {
        string name;
        string relationshipType;
        bool isVerified;
        uint256 timestamp;
        string ipfsHash;
    }

    mapping(address => UserProfile) public profiles;
    mapping(address => Reference[]) private references;
    mapping(address => bool) public authorizedAI;
    mapping(address => bool) public authorizedVerifiers;

    uint256 public constant MIN_SCORE = 0;
    uint256 public constant MAX_SCORE = 100;
    uint256 public constant MAX_REFERENCES = 10;

    event ProfileUpdated(
        address indexed user,
        string name,
        string ipfsHash,
        uint256 timestamp
    );

    event ScoreUpdated(
        address indexed user,
        uint256 overallScore,
        uint256 financialScore,
        uint256 professionalScore,
        uint256 socialScore,
        uint256 timestamp
    );

    event ReferenceAdded(
        address indexed user,
        string name,
        string relationshipType,
        string ipfsHash,
        uint256 timestamp
    );

    event ReferenceVerified(
        address indexed user,
        uint256 referenceIndex,
        address verifier,
        uint256 timestamp
    );

    event AIAuthorized(address indexed ai, uint256 timestamp);
    event AIRevoked(address indexed ai, uint256 timestamp);
    event VerifierAuthorized(address indexed verifier, uint256 timestamp);
    event VerifierRevoked(address indexed verifier, uint256 timestamp);

    constructor() Ownable(msg.sender) {
        _pause(); // Start paused for safety
    }

    modifier onlyAuthorizedAI() {
        require(authorizedAI[msg.sender], "TrustNet: caller is not authorized AI");
        _;
    }

    modifier onlyAuthorizedVerifier() {
        require(
            authorizedVerifiers[msg.sender],
            "TrustNet: caller is not authorized verifier"
        );
        _;
    }

    modifier validScore(uint256 score) {
        require(
            score >= MIN_SCORE && score <= MAX_SCORE,
            "TrustNet: score out of range"
        );
        _;
    }

    function authorizeAI(address _ai) external onlyOwner {
        require(_ai != address(0), "TrustNet: invalid AI address");
        require(!authorizedAI[_ai], "TrustNet: AI already authorized");
        
        authorizedAI[_ai] = true;
        emit AIAuthorized(_ai, block.timestamp);
    }

    function revokeAI(address _ai) external onlyOwner {
        require(authorizedAI[_ai], "TrustNet: AI not authorized");
        
        authorizedAI[_ai] = false;
        emit AIRevoked(_ai, block.timestamp);
    }

    function authorizeVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "TrustNet: invalid verifier address");
        require(
            !authorizedVerifiers[_verifier],
            "TrustNet: verifier already authorized"
        );
        
        authorizedVerifiers[_verifier] = true;
        emit VerifierAuthorized(_verifier, block.timestamp);
    }

    function revokeVerifier(address _verifier) external onlyOwner {
        require(
            authorizedVerifiers[_verifier],
            "TrustNet: verifier not authorized"
        );
        
        authorizedVerifiers[_verifier] = false;
        emit VerifierRevoked(_verifier, block.timestamp);
    }

    function updateProfile(
        string calldata _name,
        string calldata _ipfsHash
    ) external whenNotPaused nonReentrant {
        require(bytes(_name).length > 0, "TrustNet: name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "TrustNet: IPFS hash cannot be empty");

        profiles[msg.sender].name = _name;
        profiles[msg.sender].ipfsHash = _ipfsHash;
        profiles[msg.sender].isActive = true;
        profiles[msg.sender].lastUpdated = block.timestamp;

        emit ProfileUpdated(msg.sender, _name, _ipfsHash, block.timestamp);
    }

    function updateScores(
        address _user,
        uint256 _overall,
        uint256 _financial,
        uint256 _professional,
        uint256 _social
    )
        external
        whenNotPaused
        nonReentrant
        onlyAuthorizedAI
        validScore(_overall)
        validScore(_financial)
        validScore(_professional)
        validScore(_social)
    {
        require(_user != address(0), "TrustNet: invalid user address");
        require(
            profiles[_user].isActive,
            "TrustNet: profile does not exist or is inactive"
        );

        UserProfile storage profile = profiles[_user];
        profile.overallScore = _overall;
        profile.financialScore = _financial;
        profile.professionalScore = _professional;
        profile.socialScore = _social;
        profile.lastUpdated = block.timestamp;

        emit ScoreUpdated(
            _user,
            _overall,
            _financial,
            _professional,
            _social,
            block.timestamp
        );
    }

    function addReference(
        string calldata _name,
        string calldata _relationshipType,
        string calldata _ipfsHash
    ) external whenNotPaused nonReentrant {
        require(bytes(_name).length > 0, "TrustNet: name cannot be empty");
        require(
            bytes(_relationshipType).length > 0,
            "TrustNet: relationship type cannot be empty"
        );
        require(
            bytes(_ipfsHash).length > 0,
            "TrustNet: IPFS hash cannot be empty"
        );
        require(
            references[msg.sender].length < MAX_REFERENCES,
            "TrustNet: maximum references reached"
        );

        references[msg.sender].push(
            Reference({
                name: _name,
                relationshipType: _relationshipType,
                isVerified: false,
                timestamp: block.timestamp,
                ipfsHash: _ipfsHash
            })
        );

        emit ReferenceAdded(
            msg.sender,
            _name,
            _relationshipType,
            _ipfsHash,
            block.timestamp
        );
    }

    function verifyReference(
        address _user,
        uint256 _referenceIndex
    ) external whenNotPaused nonReentrant onlyAuthorizedVerifier {
        require(_user != address(0), "TrustNet: invalid user address");
        require(
            _referenceIndex < references[_user].length,
            "TrustNet: invalid reference index"
        );
        require(
            !references[_user][_referenceIndex].isVerified,
            "TrustNet: reference already verified"
        );

        references[_user][_referenceIndex].isVerified = true;
        emit ReferenceVerified(
            _user,
            _referenceIndex,
            msg.sender,
            block.timestamp
        );
    }

    function getProfile(
        address _user
    ) external view returns (UserProfile memory) {
        return profiles[_user];
    }

    function getReferences(
        address _user
    ) external view returns (Reference[] memory) {
        return references[_user];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}