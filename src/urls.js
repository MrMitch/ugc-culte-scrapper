const base = "https://www.ugc.fr";

export default {
    root: () => base,
    theater: id => `${base}/cinema.html?id=${id}#event`,
    screening: id =>`${base}/reservationSeances.html?id=${id}`
}
