import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import LoadingIndicator from "../../Components/LoadingIndicator";
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';

/*
 * Don't worry about setCharacterNFT just yet, we will talk about it soon!
 */
const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [mintingCharacter, setMintingCharacter] = useState(false);

    const mintCharacterNFTAction = async (characterId) => {
        try {
          if (gameContract) {
            setMintingCharacter(true);
            console.log('Minting character in progress...');
            const mintTxn = await gameContract.mintCharacterNFT(characterId);
            await mintTxn.wait();
            console.log('mintTxn:', mintTxn);
            setMintingCharacter(false);
          }
        } catch (error) {
          console.warn('MintCharacterAction Error:', error);
          setMintingCharacter(false);
        }
      };

    useEffect(() => {
        const { ethereum } = window;
      
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const gameContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            myEpicGame.abi,
            signer
          );
      
          /*
           * This is the big difference. Set our gameContract in state.
           */
          setGameContract(gameContract);
        } else {
          console.log('Ethereum object not found');
        }
    }, []);

    useEffect(() => {
        const getCharacters = async () => {
          try {
            console.log('Getting contract characters to mint');

            const charactersTxn = await gameContract.getAllDefaultCharacters();
            console.log('charactersTxn:', charactersTxn);
      
            const characters = charactersTxn.map((characterData) =>
              transformCharacterData(characterData)
            );
      
            setCharacters(characters);
          } catch (error) {
            console.error('Something went wrong fetching characters:', error);
          }
        };

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(
              `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            );
            
            alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)

            if (gameContract) {
              const characterNFT = await gameContract.checkIfUserHasNFT();
              console.log('CharacterNFT: ', characterNFT);
              setCharacterNFT(transformCharacterData(characterNFT));
            }
        };

        if (gameContract) { 
          getCharacters();
          gameContract.on('CharacterNFTMinted', onCharacterMint);
        }
        return () => {
            if (gameContract) {
              gameContract.off('CharacterNFTMinted', onCharacterMint);
            }
        };
    }, [gameContract]);

    // **********************render methods***********
    const renderCharacters = () =>
        characters.map((character, index) => (
            <div className="character-item" key={character.name}>
            <div className="name-container">
                <p>{character.name}</p>
            </div>
            <img src={character.imageURI} alt={character.name} />
            <button
                type="button"
                className="character-mint-button"
                onClick={()=> mintCharacterNFTAction(index)}
            >{`Mint ${character.name}`}</button>
            </div>
        )
    );
      
  return (
    <div className="select-character-container">
      <h2>Check ya self, before you wreck ya self. Mint Your Superstar.</h2>
        {characters.length > 0 && (
            <div className="character-grid">{renderCharacters()}</div>
        )}
        {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          <img
            src="https://media.giphy.com/media/TuZ8v66TzGeYJW23as/giphy.gif"
            alt="Minting loading indicator"
          />
        </div>
    )}
    </div>
  );
};

export default SelectCharacter;