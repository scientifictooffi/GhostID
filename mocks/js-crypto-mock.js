
module.exports = {
  
  poseidon: {
    hash: (inputs) => {
      console.log('Mock poseidon hash called with inputs:', inputs);
      
      return BigInt('12345678901234567890123456789012345678901234567890');
    },
  },
  babyjub: {
    PrivateKey: class {
      constructor(key) {
        this.key = key || '0x1234567890abcdef';
      }
      
      public() {
        return {
          compress: () => '0xcompressedpublickey',
        };
      }
    },
  },
};