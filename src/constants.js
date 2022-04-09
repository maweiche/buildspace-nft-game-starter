require('dotenv').config();

const CONTRACT_ADDRESS = '0x3e613C37eaAd18EE10AAd909f77DafDd71A08b4c';

const transformCharacterData = (characterData) => {
    return {
      name: characterData.name,
      imageURI: characterData.imageURI,
      hp: characterData.hp.toNumber(),
      maxHp: characterData.maxHp.toNumber(),
      attackDamage: characterData.attackDamage.toNumber(),
    };
};

export { CONTRACT_ADDRESS, transformCharacterData };
