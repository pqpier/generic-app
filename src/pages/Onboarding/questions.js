const questions = [
  {
    id: "A",
    title: "Você já tem experiência com investimentos no mercado financeiro?",
    answers: [
      "Sim, tenho experiência com investimentos",
      "Não, não tenho experiência com investimentos",
    ],
  },
  {
    id: "B",
    flowOf: "A",
    title: "Que tipo de investimentos você realizou anteriormente?",
    answers: [
      "Renda Fixa",
      "Forex e CFDs",
      "Ações na B3",
      "Mini índice/dólar",
      "Cripto",
      "Opções Binárias",
    ],
    multiple: true,
  },
  {
    id: "C",
    title: "Qual frase melhor descreve o seu perfil de investidor?",
    answers: [
      "Prefiro investimentos seguros, mesmo que rendam menos",
      "Prefiro investimentos com risco moderado e rendimento médio",
      "Prefiro investimentos com risco alto e rendimento alto",
    ],
  },
  {
    id: "D",
    title: "Qual é o seu objetivo ao investir?",
    answers: [
      "Viver dos investimentos",
      "Aumentar o meu patrimônio",
      "Atingir a independência financeira",
      "Complementar a minha renda atual",
    ],
  },
  {
    id: "E",
    title: "Quanto pretende investir do seu dinheiro para acelerar os lucros?",
    answers: [
      "Até R$2.500,00",
      "De R$2.500,00 a R$10.000,00",
      "De R$10.000,00 a R$50.000,00",
      "De R$50.000,00 a R$100.000,00",
      "Mais de R$100.000,00",
    ],
  },
];

export default questions;
