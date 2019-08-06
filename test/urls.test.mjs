import urls from "../src/urls";

test('urls', () => {
    expect(urls.root()).toBe('https://www.ugc.fr');
    expect(urls.theater(30)).toBe('https://www.ugc.fr/cinema.html?id=30#events');
    expect(urls.screening(999999)).toBe('https://www.ugc.fr/reservationSeances.html?id=999999');
});
