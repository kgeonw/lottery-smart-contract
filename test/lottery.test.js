const Lottery = artifacts.require("Lottery");
const assertRevert = require("./asserRevert");
const expectEvent = require("./expectEvent");

contract("Lottery", ([deployer, user1, user2]) => {
    let lottery;
    let betAmount = 5 * 10 ** 15;
    let betAmountBN = new web3.utils.BN(betAmount);
    let bet_block_interval = 3;

    beforeEach(async () => {
        lottery = await Lottery.new();
    });

    it("getPot should return current pot", async () => {
        let pot = await lottery.getPot();
        assert.equal(pot, 0);
    });

    describe("Bet", () => {
        it("should fail when the bet money is not 0.005 ETH", async () => {
            // Fail transaction
            await assertRevert(lottery.bet("0xab", {from : user1, value : 4000000000000000}));
            
            //  transaction object {chainId, value, to, from, gas(Limit), gasPrice}
        })

        it("should put the bet to the bet queue with 1 bet", async () => {
            // bet
            let receipt = await lottery.bet("0xab", {from : user1, value : betAmount})
            // console.log(receipt);

            let pot = await lottery.getPot();
            assert.equal(pot, 0);

            // check contractBalance == 0.005
            let contractBalance = await web3.eth.getBalance(lottery.address);
            assert.equal(contractBalance, betAmount);

            // check betInfo
            let currentBlockNumber = await web3.eth.getBlockNumber();
            
            let bet = await lottery.getBetInfo(0);
            assert.equal(bet.answerBlockNumber, currentBlockNumber + bet_block_interval);
            assert.equal(bet.bettor, user1);
            assert.equal(bet.challenges, "0xab");

            // check log
            // console.log(receipt);
            await expectEvent.inLogs(receipt.logs, "BET");
        })
    })

    describe("isMatch", () => {
        let blockHash = '0xabcfb5d48a08b02cb33dfe7e0aebe1b3b0e3be68f2af750aee5382d900905cdf';
        
        it("should be BettingResult.Win when two characters match", async () => {
            let matchingResult = await lottery.isMatch('0xab', blockHash);
            assert.equal(matchingResult, 1);
        })

        it("should be BettingResult.Fail when two characters not match", async () => {
            let matchingResult = await lottery.isMatch('0xcd', blockHash);
            assert.equal(matchingResult, 0);
        })

        it("should be BettingResult.Draw when two characters half match", async () => {
            let matchingResult = await lottery.isMatch('0xaf', blockHash);
            assert.equal(matchingResult, 2);

            matchingResult = await lottery.isMatch('0xfb', blockHash);
            assert.equal(matchingResult, 2);
        })
    })

    describe("Distribute", () => {
        describe("When the answer is checkable", () => {
            it("should give the user the pot when the answer matches", async () => {
                // 두글자 다 맞았을때
                await lottery.setAnswerForTest('0xabec17438e4f0afb9cc8b77ce84bb7fd501497cfa9a1695095247daa5b4b7bcc', {from:deployer});

                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}); // 1 -> 4
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}); // 2 -> 5
                await lottery.betAndDistribute('0xab', {from:user1, value:betAmount}); // 3 -> 6
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}); // 4 -> 7
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}); // 5 -> 8
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}); // 6 -> 9

                let potBefore = await lottery.getPot(); //  == 0.01 ETH
                let user1BalanceBefore = await web3.eth.getBalance(user1);

                let receipt7 = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}); // 7 -> 10 // user1에게 pot이 간다

                let potAfter = await lottery.getPot(); // == 0
                let user1BalanceAfter = await web3.eth.getBalance(user1); // == before + 0.015 ETH

                // pot 의 변화량 확인
                assert.equal(potBefore.toString(), new web3.utils.BN('10000000000000000').toString());
                assert.equal(potAfter.toString(), new web3.utils.BN('0').toString());

                // user(winner)의 밸런스를 확인
                user1BalanceBefore = new web3.utils.BN(user1BalanceBefore);
                assert.equal(user1BalanceBefore.add(potBefore).add(betAmountBN).toString(), new web3.utils.BN(user1BalanceAfter).toString());
            })

            it("should give the user the pot when a single character matches", async () => {
                // 한 글자 맞았을때
                await lottery.setAnswerForTest('0xabec17438e4f0afb9cc8b77ce84bb7fd501497cfa9a1695095247daa5b4b7bcc', {from:deployer})
                
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 1 -> 4
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 2 -> 5
                await lottery.betAndDistribute('0xaf', {from:user1, value:betAmount}) // 3 -> 6
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 4 -> 7
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 5 -> 8
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 6 -> 9
                
                let potBefore = await lottery.getPot(); //  == 0.01 ETH
                let user1BalanceBefore = await web3.eth.getBalance(user1);
                
                let receipt7 = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 7 -> 10 // user1에게 pot이 간다

                let potAfter = await lottery.getPot(); // == 0.01 ETH
                let user1BalanceAfter = await web3.eth.getBalance(user1); // == before + 0.005 ETH

                // pot 의 변화량 확인
                assert.equal(potBefore.toString(), potAfter.toString());

                // user(winner)의 밸런스를 확인
                user1BalanceBefore = new web3.utils.BN(user1BalanceBefore);
                assert.equal(user1BalanceBefore.add(betAmountBN).toString(), new web3.utils.BN(user1BalanceAfter).toString());
            })

            it("should get the eth of user when the answer does not match at all", async () => {
                // 다 틀렸을때
                await lottery.setAnswerForTest('0xabec17438e4f0afb9cc8b77ce84bb7fd501497cfa9a1695095247daa5b4b7bcc', {from:deployer})
                
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 1 -> 4
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 2 -> 5
                await lottery.betAndDistribute('0xef', {from:user1, value:betAmount}) // 3 -> 6
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 4 -> 7
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 5 -> 8
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 6 -> 9
                
                let potBefore = await lottery.getPot(); //  == 0.01 ETH
                let user1BalanceBefore = await web3.eth.getBalance(user1);
                
                let receipt7 = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 7 -> 10 // user1에게 pot이 간다

                let potAfter = await lottery.getPot(); // == 0.015 ETH
                let user1BalanceAfter = await web3.eth.getBalance(user1); // == before

                // pot 의 변화량 확인
                assert.equal(potBefore.add(betAmountBN).toString(), potAfter.toString());

                // user(winner)의 밸런스를 확인
                user1BalanceBefore = new web3.utils.BN(user1BalanceBefore);
                assert.equal(user1BalanceBefore.toString(), new web3.utils.BN(user1BalanceAfter).toString());
            })
        })

        describe("When the answer is not revealed (Not mind)", () => {
            
        })

        describe("When the answer is not revealed (Block limit is passed)", () => {
            
        })
    })
});