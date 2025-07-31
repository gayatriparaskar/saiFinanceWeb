/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins"],
        regular: ["Poppins-Regular"],
        poppinsbold: ["Poppins-Bold"],
        poppinsblack: ["Poppins-Black"],
        cunia: ["Cunia"],
        cuniaRegular: ["Cunia-Regular"],
        gilroy: ["Gilroy"],
        yung: ["Young"],
        poppins: ["Poppins", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
      },
      colors: {
        primary: "#fd3a55",
        coolGray: "#8493A8",
        midGray: "#ADB9CA",
        lightGray: "#CAD3DF",
        deepBlue: "#0E0E52",
        brightYellow: "#FFC13D",
        indigo: "#4169e1",
        darkBlue: "#1167b1",
        EB5757: "#EB5757",
        DEE8FF: "#DEE8FF",
        EFEEFB: "#EFEEFB",
        D7D4F5: "#D7D4F5",
        B9B6EC: "#B9B6EC",
        white: "#ffffff",
        F5F8FF: "#F5F8FF",
        green: "#23A455",
        lightPink: "#D02F68",
        darkGray: "#4E4E4E",
        // bgWhite: "#f8f8ff",
        // bgBlue: "#2d196b",
        // bgBlue: "#505081",
        bgBlue: "#FFE642",
        // bgBlueOld: "#8686AC",
        bgBlueOld: "#F2CF7E",
        DFEFFF: "#DFEFFF",
        E61A89: "#E61A89",
        Gold: "#B4833E",
        lightGold: "#EDD87D",
        Platinum: "#C7C6C4",
        lightPlatinum: "#F4F3F1",
        blue: "#4054b2",
        black: "#000000",
        Brown: "#654321",
        arrowC:"#0B0B38",
        dotC: "#9EB8D9",
        buttonC:"#B32A64",
        redC:"#eb4034",
        singC:"##0e0e52",
        Waletcolor:"#21169B",
        yellowcolor:"#FFFFF0",
        purple1:"#471594",
        // purple:"#FF782D",
        purple:"#FF7900",
        red:"#FF0000",
        bgWhite:"#FDF8EE",
        heroBg: "#4D2C5E03",
        tagsky:"#1BCBE3",
        crimson:"#FF7E42",
        forest:"#0056B3",
        luxury:"#D32F2F ",
        yellow:"#6A57F3",
        softLightBlue:"#4750DD ",
        darkSlate:"#2C3E50",
        mutedGray:"#6C757D",
        almostBlack:"#1A1A1A",
        darkroyalblue:"#0C287B"


      },
     
      
    },
  },
  plugins:  [
    require('flowbite/plugin')
],
}

