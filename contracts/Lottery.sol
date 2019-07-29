pragma solidity >=0.4.21 <0.6.0;

contract Lottery {
    struct BetInfo {
        uint256 answerBlockNumber;
        address payable bettor; // address에 돈을 보내기 위해 필요한 payable
        byte challenges; // 0xab
    }

    uint256 private _tail;
    uint256 private _head;
    mapping (uint256 => BetInfo) private _bets;

    address public owner;

    uint256 constant internal BLOCK_LIMIT = 256;
    uint256 constant internal BET_BLOCK_INTERVAL = 3;
    uint256 constant internal BET_AMOUNT = 5 * 10 ** 15;

    uint256 private _pot;

    enum BlockStatus { Checkable, NotRevealed, BlockLimitPassed }
    event BET(uint256 index, address bettor, uint256 amount, byte challenges, uint256 answerBetInfo);

    constructor() public {
        owner = msg.sender;
    }

    // smart contract의 변수를 조회하기 위해서는 view 사용
    function getPot() public view returns (uint256 pot) {
        return _pot;
    }
    /**
     * @dev 베팅한다. 유저는 0.005 ETH를 보내야하고, 베팅용 1byte 글자를 보낸다.
      * 큐에 저장된 베팅정보는 이후 distribute 함수에서 해결된다.
     * @param challenges 유저가 베팅하는 글자
     * @return 함수가 잘 수행되었는지 확인하는 bool 값
     */
    function bet(byte challenges) public payable returns (bool result) {
        // check the proper ether is sent
        require(msg.value == BET_AMOUNT, "Not enough ETH");

        // save the bet to the queue
        // push bet to the queue
        require(pushBet(challenges), "Fail to add a new Bet Info");

        // emit event
        emit BET(_tail-1, msg.sender, msg.value, challenges, block.number + BET_BLOCK_INTERVAL);

        return true;
    }

    // Distribute
    function distribute() public {

        uint256 cur;
        BetInfo memory b;
        BlockStatus currentBlockStatus;

        for(cur=_head;cur<_tail;cur++) {
            b = _bets[cur];
            currentBlockStatus = getBlockStatus(b.answerBlockNumber);

            // Checkable : block.number > answerBlockNumber && block.number < BLOCK_LIMIT + answerBlocknumber
            if (currentBlockStatus == BlockStatus.Checkable) {
                // if win, bettor gets pot
            
                // if fail, bettor's money goes pot
            
                // if draw, refund bettor's money
            }

            // Not Revealed : block.number <= answerBlockNumber
            if (currentBlockStatus == BlockStatus.NotRevealed) {
                break;
            }

            // Block Limit Passwd : block.number >= answerBlockNumber + BLOCK_LIMIT
            if (currentBlockStatus == BlockStatus.BlockLimitPassed) {
                // refund
                // emit refund
            }
            popBet(cur);
        }
    }

    function getBlockStatus(uint256 answerBlockNumber) internal view returns (BlockStatus) {
        if (block.number > answerBlockNumber && block.number < BLOCK_LIMIT + answerBlockNumber) {
            return BlockStatus.Checkable;
        }
        if (block.number <= answerBlockNumber) {
            return BlockStatus.NotRevealed;
        }
        if (block.number >= answerBlockNumber + BLOCK_LIMIT) {
            return BlockStatus.BlockLimitPassed;
        }

        return BlockStatus.BlockLimitPassed;
    }


    function getBetInfo(uint256 index) public view returns (uint256 answerBlockNumber, address bettor, byte challenges) {
        BetInfo memory b = _bets[index];
        answerBlockNumber = b.answerBlockNumber;
        bettor = b.bettor;
        challenges = b.challenges;
    }

    function pushBet(byte challenges) internal returns (bool) {
        BetInfo memory b;
        b.bettor = msg.sender;
        b.answerBlockNumber = block.number + BET_BLOCK_INTERVAL;
        b.challenges = challenges;

        _bets[_tail] = b;
        _tail++;

        return true;
    }

    function popBet(uint256 index) internal returns (bool) {
        delete _bets[index];
        return true;
    }
}
