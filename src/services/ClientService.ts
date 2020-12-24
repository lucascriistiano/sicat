export interface IClient {
  name: string;
  cpf: string;
  rg: string;
  address: string;
  profession: string;
  hidrometer: string;
  location: string;
}

export const listClients: () => Promise<IClient[]> = async () => {
  return [
		{
			'name': 'Kilvia Pereira',
			'cpf': '111.111.111-11',
			'rg': '11.111.111',
			'address': '',
			'profession': 'Agricultor(a)',
			'hidrometer': '415513',
			'location': '1',
		},
		{
			'name': 'Lucas Cristiano',
			'cpf': '222.222.222-22',
			'rg': '11.111.111',
			'address': '',
			'profession': 'Agricultor(a)',
			'hidrometer': '12345',
			'location': '2',
		},
		{
			'name': 'Bruno Pereira',
			'cpf': '333.333.333-33',
			'rg': '11.111.111',
			'address': '',
			'profession': 'Agricultor',
			'hidrometer': '54321',
			'location': '3',
		},
		// {
		// 	'name': 'Maria Luzia',
		// 	'cpf': '444.444.444-44',
		// 	'rg': '11.111.111',
		// 	'address': '',
		// 	'profession': 'Agricultor',
		// 	'hidrometer': '54321',
		// 	'location': '3',
		// }
  ]
};
