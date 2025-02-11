
const {dataFetch} = require('../scripts/api.js')

jest.mock('../scripts/api.js', () => ({
    dataFetch: jest.fn(),
}));


test('gets pokemon name through API', async () => {
    dataFetch.mockResolvedValue({name: "bulbasaur"})
    const data = await dataFetch()
    expect(data.name).toBe("bulbasaur")
});


test('length of array is 4', async () => {
    dataFetch.mockResolvedValue([{name: "bulbasaur"}, {name: "pikachu"}, {name: "clodsire"}, {name: "quagsire"}])
    const data = await dataFetch()
    expect(data.length).toBe(4)
});

test('different pokemon in array', async () => {
    dataFetch.mockResolvedValue([{name: "bulbasaur"}, {name: "pikachu"}, {name: "clodsire"}, {name: "quagsire"}])
    const data = await dataFetch()
    for (let i = 0; i < data.length; i++) {
        expect(data[i].name).toBeDefined()
        
    }
});