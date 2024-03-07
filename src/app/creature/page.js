"use client";

import { useState, useEffect } from "react";
import { connect, WalletConnection, Contract } from "near-api-js";
import * as nearAPI from "near-api-js";
import Avatar from "../(components)/Avatar/page";
import { GiHotMeal, GiMedicines } from "react-icons/gi";
import { MdFastfood } from "react-icons/md";
import { FaCircleArrowRight, FaCircleArrowLeft } from "react-icons/fa6";
import Indicators from "../(components)/Indicators/page";
import Loader from "../(components)/Loader/page";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CURRENT_CONTRACT_ID;
const CREATURE_ID = process.env.NEXT_PUBLIC_CURRENT_CONTRACT_ID;

export default function Page() {
  const [stats, setStats] = useState({});
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);
  const [contract, setContract] = useState(null);
  const [guessResult, setGuessResult] = useState(null);
  const [mealGiven, setMealGiven] = useState(null);
  // const [gameStatus, setGameStatus] = useState(null);
  const [isSick, setIsSick] = useState(false);

  let initial_weight = 4;
  let initial_hungry_meter = 0;
  let initial_happiness_meter = 2;
  let initial_is_sick = false;

  const convertContractResultToObject = (result) => {
    let stats = result;
    return JSON.parse(stats);
  };

  const giveMeal = (type) => {
    setMealGiven(type);
    setTimeout(() => setMealGiven(null), 3000);
  };

  const playGame = () => {
    setTimeout(() => setGuessResult(null), 3000);
  };

  useEffect(() => {
    const checkIfSick = async () => {
      stats?.is_sick ? setIsSick(true) : setIsSick(false);
    };

    checkIfSick();
  }, [stats?.is_sick]);

  useEffect(() => {
    async function fetchData() {
      const { keyStores } = nearAPI;

      const connectionConfig = {
        networkId: "testnet",
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://testnet.nearblocks.io",
      };

      const nearConnection = await connect(connectionConfig);

      // Create wallet connection
      const wallet = new WalletConnection(nearConnection, "tamagotchi");

      // If not signed in redirect to the NEAR wallet to sign in
      // keys will be stored in the BrowserLocalStorageKeyStore
      if (!wallet.isSignedIn())
        return wallet.requestSignIn({
          // This line causes the problem
          contractId: process.env.NEXT_PUBLIC_MAIN_CONTRACT_ID,
          methodNames: [],

          // Sender is the account ID to initialize transactions.
          // getAccountId() will return empty string if user is still unauthorized
          sender: wallet.getAccountId(),
        });

      const contract = new Contract(wallet.account(), CONTRACT_ID, {
        viewMethods: [
          "get_creature_stats",
          "check_sickness"
        ],
        changeMethods: [
          "feed",
          "play",
          "give_medicine",
          "initialize_creature",
        ],
      });

      setContract(contract);

      const init_creature_param = {
        creature_id: CREATURE_ID.toString(),
        initial_weight: initial_weight,
        initial_hungry_meter: initial_hungry_meter,
        initial_happiness_meter: initial_happiness_meter,
        initial_is_sick: initial_is_sick,
      };

      // contract.initialize_creature(init_creature_param);

      const response = await contract.get_creature_stats({
        creature_id: CREATURE_ID,
      });

      // console.log("creatureStats")
      // console.log(creatureStats)

      const creatureStats = convertContractResultToObject(response);

      setStats(creatureStats);
      setIsLoadingStats(false);
    }

    fetchData();
  }, []);

  const handleFeed = async (mealType) => {
    if (!stats?.is_sick) {
      setIsLoadingTransaction(true);
      giveMeal(mealType);
      console.log(mealType);
      await contract.feed({ creature_id: CREATURE_ID, meal_type: mealType });
      const updatedStats = await contract.get_creature_stats({
        creature_id: CREATURE_ID,
      });
      const result = convertContractResultToObject(updatedStats);
      setStats(result);
      setIsLoadingTransaction(false);
    }
  };

  const handlePlay = async (guess) => {
    if (!stats?.is_sick) {
      try {
        setIsLoadingTransaction(true);
        playGame();
        setGuessResult(null);
        const isCorrect = await contract.play({
          creature_id: CREATURE_ID,
          guess,
        });
        setGuessResult(isCorrect);
        const updatedStats = await contract.get_creature_stats({
          creature_id: CREATURE_ID,
        });
        const result = convertContractResultToObject(updatedStats);
        setStats(result);
      } catch (error) {
        console.error("Error playing the game:", error);
      } finally {
        setIsLoadingTransaction(false);
      }
    }
  };

  const handleGiveMedicine = async () => {
    setIsLoadingTransaction(true);
    await contract.give_medicine({ creature_id: CREATURE_ID });
    const updatedStats = await contract.get_creature_stats({
      creature_id: CREATURE_ID,
    });
    const result = convertContractResultToObject(updatedStats);
    setStats(result);
    setIsLoadingTransaction(false);
  };

  const handleCheckSickness = async () => {
    await contract.check_sickness({ creature_id: CREATURE_ID });
    const updatedStats = await contract.get_creature_stats({
      creature_id: CREATURE_ID,
    });
    const result = convertContractResultToObject(updatedStats);
    setIsSick(result);
  };

  if (isLoadingStats) return <Loader />;

  return (
    <div className="flex flex-col items-center h-screen">
      {stats && (
        <Indicators
          happiness_meter={stats.happiness_meter}
          hungry_meter={stats.hungry_meter}
          weight={stats.weight}
          isSick={stats.is_sick}
        />
      )}

      {guessResult !== null && (
        <p>{guessResult ? 'Congratulations! Your guess was correct!' : 'Sorry, your guess was incorrect.'}</p>
      )}

      <Avatar hapinessMeter={stats?.happiness_meter} mealType={mealGiven} isSick={stats?.is_sick} />

      <div className="flex justify-center space-x-4 absolute bottom-10">
        {isLoadingTransaction && (
          <div className="flex w-full h-full items-center justify-center bg-opacity-35 absolute left-0 top-0 z-10">
            <div className="w-8 h-8 border-t-2 border-gray-100 rounded-full animate-spin"></div>
          </div>
        )}
        <button
          onClick={() => handleFeed("meal")}
          title="Give Meal"
          disabled={isLoadingTransaction || stats?.is_sick}
          >
          <GiHotMeal
            className={`text-yellow-500 hover:text-yellow-400"
              ${isLoadingTransaction || stats?.is_sick ? 'text-gray-500 hover:text-gray-500 opacity-40' : ''}
            `}
            style={{
              width: "32px",
              height: "32px",
            }}
          />
        </button>
        <button
          onClick={() => handleFeed("snack")}
          title="Give Snack"
          disabled={isLoadingTransaction || stats?.is_sick}
        >
          <MdFastfood
            className={`text-orange-500 hover:text-orange-400"
              ${isLoadingTransaction || stats?.is_sick ? 'text-gray-500 hover:text-gray-500 opacity-40' : ''}
            `}
            style={{
              width: "32px",
              height: "32px",
            }}
          />
        </button>
        <button 
          onClick={() => handlePlay("left")} 
          title="Guess Left"
          disabled={isLoadingTransaction || stats?.is_sick}
        >
          <FaCircleArrowLeft
            className={`text-green-600 hover:text-green-500
              ${isLoadingTransaction || stats?.is_sick ? 'text-gray-500 hover:text-gray-500 opacity-40' : ''}
            `}
            style={{
              width: "32px",
              height: "32px",
            }}
          />
        </button>
        <button 
          onClick={() => handlePlay("right")} 
          title="Guess Right"
          disabled={isLoadingTransaction || stats?.is_sick}
        >
          <FaCircleArrowRight
            className={`text-green-600 hover:text-green-500
              ${isLoadingTransaction || stats?.is_sick ? 'text-gray-500 hover:text-gray-500 opacity-40' : ''}
            `}
            style={{
              width: "32px",
              height: "32px",
            }}
          />
        </button>
        <button 
          onClick={handleGiveMedicine} 
          title="Give Medicine"
          disabled={isLoadingTransaction}
        >
          <GiMedicines
            className={`text-pink-500 hover:text-pink-400
              ${isLoadingTransaction ? 'text-gray-500 hover:text-gray-500 opacity-40' : ''}
            `}
            style={{
              width: "32px",
              height: "32px",
            }}
          />
        </button>
      </div>
    </div>
  );
}
