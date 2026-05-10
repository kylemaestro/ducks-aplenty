"""
Create SQLite schema and load initial duck species with fun facts + citations (JSON URL arrays).
Run from repo root: python backend/scripts/seed_db.py
Or from backend: python scripts/seed_db.py

Facts avoid substrings of the species common name and use "this duck" / "these ducks" patterns.
Each fact includes at least one credible source URL (Cornell Lab, Audubon, RSPB, Birds of the World, etc.).
"""
import json
import sqlite3
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = BACKEND_ROOT / "data" / "ducks.db"

# Cornell All About Birds guide base (species slug uses underscores).
AAB = "https://www.allaboutbirds.org/guide"


def aab(slug: str, page: str = "overview") -> str:
    return f"{AAB}/{slug}/{page}"


def audubon(slug: str) -> str:
    """Audubon field guide; slug is hyphenated lowercase common name."""
    return f"https://www.audubon.org/field-guide/bird/{slug}"


# --- Audited facts: wording aligned with cited sources; 2 links per row where helpful. ---

SPECIES_AND_FACTS: list[tuple[str, str, list[tuple[str, list[str]]]]] = [
    (
        "Mallard",
        "Anas platyrhynchos",
        [
            (
                "Known for a glossy green head that comes from feather structure instead of pigment, this duck is a familiar sight on ponds across the Northern Hemisphere.",
                [
                    aab("Mallard", "overview"),
                    audubon("mallard"),
                ],
            ),
            (
                "These ducks are the wild ancestors behind most barnyard strains still seen today.",
                [
                    aab("Mallard", "lifehistory"),
                    "https://www.britannica.com/animal/Mallard",
                ],
            ),
            (
                "Sprinting along the surface while flapping hard for liftoff, and sometimes laying eggs in another bird's nest—these ducks bring drama to every puddle.",
                [
                    aab("Mallard", "lifehistory"),
                    aab("Mallard", "behavior"),
                ],
            ),
            (
                "Known for explosive takeoffs from water after a short runway dash, this duck treats wetlands like a busy airport.",
                [
                    aab("Mallard", "lifehistory"),
                    audubon("mallard"),
                ],
            ),
        ],
    ),
    (
        "Wood Duck",
        "Aix sponsa",
        [
            (
                "Known for day-old chicks leaping from tree-cavity nests dozens of feet down to water below, this duck turns nesting into an action sequence.",
                [
                    aab("Wood_Duck", "lifehistory"),
                    audubon("wood-duck"),
                ],
            ),
            (
                "These ducks wear ornate patterning on the drake that field guides compare to formal evening wear.",
                [
                    aab("Wood_Duck", "overview"),
                    audubon("wood-duck"),
                ],
            ),
            (
                "Strong claws for bark gripping, cavity nests, and nest boxes beside quiet water—prime real estate defines life for these ducks.",
                [
                    aab("Wood_Duck", "lifehistory"),
                    aab("Wood_Duck", "overview"),
                ],
            ),
            (
                "Known for sometimes raising two broods in a single breeding season in warmer regions, this duck schedules double headers.",
                [
                    aab("Wood_Duck", "lifehistory"),
                    audubon("wood-duck"),
                ],
            ),
        ],
    ),
    (
        "Northern Pintail",
        "Anas acuta",
        [
            (
                "Known for an elongated central tail on the drake that sketches a needle silhouette in flight, this duck is built for elegance at altitude.",
                [
                    aab("Northern_Pintail", "overview"),
                    audubon("northern-pintail"),
                ],
            ),
            (
                "These ducks migrate enormous distances, linking Arctic nesting grounds to winter coasts far to the south.",
                [
                    aab("Northern_Pintail", "lifehistory"),
                    audubon("northern-pintail"),
                ],
            ),
            (
                "Shallow, tipped-forward feeding without deep diving—salad bars in the shallows suit these ducks.",
                [
                    aab("Northern_Pintail", "food"),
                    aab("Northern_Pintail", "lifehistory"),
                ],
            ),
            (
                "Prairie pothole cycles swing continental numbers—wet or dry years move flocks of these ducks like a tide.",
                [
                    "https://www.ducks.org/conservation/wetlands/prairie-pothole-region",
                    audubon("northern-pintail"),
                ],
            ),
        ],
    ),
    (
        "American Wigeon",
        "Mareca americana",
        [
            (
                "Known for soft whistles instead of loud quacks across crowded marshes, this duck keeps marsh conversations surprisingly quiet.",
                [
                    aab("American_Wigeon", "sounds"),
                    audubon("american-wigeon"),
                ],
            ),
            (
                "These ducks sometimes lift snacks from divers surfacing with vegetation—manners optional, results tasty.",
                [
                    aab("American_Wigeon", "food"),
                    aab("American_Wigeon", "lifehistory"),
                ],
            ),
            (
                "A short bill built for grazing lawn-like edges and plucking plants marks feeding style for these ducks.",
                [
                    aab("American_Wigeon", "overview"),
                    audubon("american-wigeon"),
                ],
            ),
            (
                "Known for a crisp white forehead patch visible through gray winter glare, this duck wears a lighthouse on its face.",
                [
                    aab("American_Wigeon", "overview"),
                    audubon("american-wigeon"),
                ],
            ),
        ],
    ),
    (
        "Canvasback",
        "Aythya valisineria",
        [
            (
                "Known for a steep forehead profile that sorts it from rusty-headed diving partners at a glance, this duck loves geometry homework.",
                [
                    aab("Canvasback", "overview"),
                    audubon("canvasback"),
                ],
            ),
            (
                "These ducks plunge meters down to tug sago pondweed tubers from soft bottoms on wintering waters.",
                [
                    aab("Canvasback", "food"),
                    "https://birdsoftheworld.org/bow/species/canvas/cur/introduction",
                ],
            ),
            (
                "Once a centerpiece at fancy dinner tables to the point of early conservation alarm—market fame still haunts the story of these ducks.",
                [
                    audubon("canvasback"),
                    "https://en.wikipedia.org/wiki/Canvasback#Relationship_with_humans",
                ],
            ),
            (
                "Known for athletic underwater kicks chasing submerged vegetation, this duck treats lakes like gyms with lunch buffets.",
                [
                    aab("Canvasback", "food"),
                    aab("Canvasback", "lifehistory"),
                ],
            ),
        ],
    ),
    (
        "Hooded Merganser",
        "Lophodytes cucullatus",
        [
            (
                "Known for snapping a fan-shaped crest up for display like a pop-up sign, this duck edits its silhouette on demand.",
                [
                    aab("Hooded_Merganser", "overview"),
                    audubon("hooded-merganser"),
                ],
            ),
            (
                "Serrated bill edges that grip slippery fish—cutlery included—define feeding gear for these ducks.",
                [
                    aab("Hooded_Merganser", "food"),
                    "https://birdsoftheworld.org/bow/species/hoomer/cur/introduction#dietforaging",
                ],
            ),
            (
                "Tree cavities and roomy nest boxes beside quiet ponds rank high on nesting wish lists for these ducks.",
                [
                    aab("Hooded_Merganser", "lifehistory"),
                    audubon("hooded-merganser"),
                ],
            ),
            (
                "Huge-eyed chicks bail from nest holes toward maternal calls below—opening night is literal for these ducks.",
                [
                    aab("Hooded_Merganser", "lifehistory"),
                    aab("Hooded_Merganser", "overview"),
                ],
            ),
        ],
    ),
    (
        "Common Eider",
        "Somateria mollissima",
        [
            (
                "Known for dense colonial nesting that can carpet islands in breeding plumage during summer, this duck prefers neighbors close by.",
                [
                    aab("Common_Eider", "lifehistory"),
                    audubon("common-eider"),
                ],
            ),
            (
                "Insulating breast down harvested sustainably in some traditions—luxury bedding meets seabird field craft for these ducks.",
                [
                    "https://birdsoftheworld.org/bow/species/comeid/cur/introduction",
                    audubon("common-eider"),
                ],
            ),
            (
                "Chicks pool into crèches watched by a rotating crew while parents forage—daycare at sea describes these ducks.",
                [
                    aab("Common_Eider", "lifehistory"),
                    "https://birdsoftheworld.org/bow/species/comeid/cur/introduction#repro",
                ],
            ),
            (
                "Heavy bodies needing a foot-powered runway across chop for takeoff—no vertical liftoff theatrics for this duck.",
                [
                    aab("Common_Eider", "lifehistory"),
                    audubon("common-eider"),
                ],
            ),
        ],
    ),
    (
        "Harlequin Duck",
        "Histrionicus histrionicus",
        [
            (
                "Known for summer breeding on loud, boulder-strewn whitewater instead of tranquil ponds, this duck picks the splash zone every time.",
                [
                    aab("Harlequin_Duck", "lifehistory"),
                    audubon("harlequin-duck"),
                ],
            ),
            (
                "A genus epithet evoking stage players fits costume-level patterning on these ducks.",
                [
                    "https://birdsoftheworld.org/bow/species/harduc/cur/introduction",
                    "https://www.merriam-webster.com/dictionary/histrionic",
                ],
            ),
            (
                "Surf-thrashed winter coastlines with tidepool groceries suit winter shifts for these ducks.",
                [
                    aab("Harlequin_Duck", "lifehistory"),
                    audubon("harlequin-duck"),
                ],
            ),
            (
                "Known for returning to the same turbulent stream stretches across years, this duck keeps season tickets to rapids.",
                [
                    "https://birdsoftheworld.org/bow/species/harduc/cur/introduction",
                    aab("Harlequin_Duck", "lifehistory"),
                ],
            ),
        ],
    ),
    (
        "Mandarin Duck",
        "Aix galericulata",
        [
            (
                "Known for ornate sail-like plumes that are actually remodeled contour feathers, this duck tricks the eye with folded formalwear.",
                [
                    aab("Mandarin_Duck", "overview"),
                    "https://birdsoftheworld.org/bow/species/manduc/cur/introduction#fieldid",
                ],
            ),
            (
                "East Asian roots plus ornamental-aviary escapees explain surprise park pond cameos from these ducks.",
                [
                    aab("Mandarin_Duck", "lifehistory"),
                    "https://www.iucnredlist.org/species/22680117/92859288",
                ],
            ),
            (
                "Tree cavities and branch perches double as runways and apartments for these ducks.",
                [
                    aab("Mandarin_Duck", "lifehistory"),
                    audubon("mandarin-duck"),
                ],
            ),
            (
                "Known for centuries of artistic pairing with lotus motifs in East Asian painting, this duck crosses field guides and museum walls.",
                [
                    "https://www.britannica.com/animal/mandarin-duck",
                    "https://en.wikipedia.org/wiki/Mandarin_duck#Relationship_with_humans",
                ],
            ),
        ],
    ),
    (
        "Ruddy Duck",
        "Oxyura jamaicensis",
        [
            (
                "Known for a bright blue bill on breeding males—neon lip gloss at the marsh runway—this duck wins the accessory round.",
                [
                    aab("Ruddy_Duck", "overview"),
                    audubon("ruddy-duck"),
                ],
            ),
            (
                "These ducks cock a stiff tail skyward for display like a semaphore flag on the water.",
                [
                    aab("Ruddy_Duck", "lifehistory"),
                    audubon("ruddy-duck"),
                ],
            ),
            (
                "Rigid tail feathers aid stiff-tailed posture and signaling—architecture matters for these ducks.",
                [
                    "https://birdsoftheworld.org/bow/species/rudduc/cur/introduction#morph",
                    aab("Ruddy_Duck", "overview"),
                ],
            ),
            (
                "Introduced populations overseas hybridized with a rare European relative and triggered large-scale control programs—these ducks still make headlines.",
                [
                    "https://www.rspb.org.uk/birds-and-wildlife/wildlife-guides/bird-a-z/ruddy-duck/",
                    "https://birdsoftheworld.org/bow/species/rudduc/cur/introduction#conserv",
                ],
            ),
        ],
    ),
    (
        "Northern Shoveler",
        "Spatula clypeata",
        [
            (
                "Known for a spatula-wide bill packed with filtering lamellae, this duck vacuums crustaceans and seeds from the soup line.",
                [
                    aab("Northern_Shoveler", "overview"),
                    audubon("northern-shoveler"),
                ],
            ),
            (
                "Whirling in tight circles to stir food-rich micro-whirlpools—cafeteria sabotage etiquette from these ducks.",
                [
                    aab("Northern_Shoveler", "food"),
                    aab("Northern_Shoveler", "lifehistory"),
                ],
            ),
            (
                "Eclipse plumage can look downright plain after breeding greens and chestnut flank paint for this duck.",
                [
                    aab("Northern_Shoveler", "overview"),
                    audubon("northern-shoveler"),
                ],
            ),
            (
                "Cartoonishly oversized bill proportions arrive early—even hatchlings flex outsized hardware for these ducks.",
                [
                    aab("Northern_Shoveler", "lifehistory"),
                    "https://birdsoftheworld.org/bow/species/norsho/cur/introduction#fieldid",
                ],
            ),
        ],
    ),
    (
        "Tufted Duck",
        "Aythya fuligula",
        [
            (
                "Known for a jaunty drooping crest—muted on females—for flair in tight rafts, this duck keeps hairstyles on trend.",
                [
                    aab("Tufted_Duck", "overview"),
                    "https://www.rspb.org.uk/birds-and-wildlife/wildlife-guides/bird-a-z/tufted-duck/",
                ],
            ),
            (
                "These ducks are everyday across Eurasia yet send rarity chasers scrambling when they appear out of range elsewhere.",
                [
                    aab("Tufted_Duck", "lifehistory"),
                    "https://birdsoftheworld.org/bow/species/tufduc/cur/introduction#distrib",
                ],
            ),
            (
                "Deep freshwater dives targeting mollusks and insects—elevator rides to lunch describe these ducks.",
                [
                    aab("Tufted_Duck", "food"),
                    "https://www.rspb.org.uk/birds-and-wildlife/wildlife-guides/bird-a-z/tufted-duck/",
                ],
            ),
            (
                "Winter reservoir megaflocks that look like confetti on radar—social season peaks for these ducks.",
                [
                    "https://www.rspb.org.uk/birds-and-wildlife/wildlife-guides/bird-a-z/tufted-duck/",
                    aab("Tufted_Duck", "lifehistory"),
                ],
            ),
        ],
    ),
    (
        "Common Goldeneye",
        "Bucephala clangula",
        [
            (
                "Known for lemon-bright irises that gleam on sunny days, this duck sports optics you cannot buy at a store.",
                [
                    aab("Common_Goldeneye", "overview"),
                    audubon("common-goldeneye"),
                ],
            ),
            (
                "These ducks adopt old pileated digs and nest boxes when natural cavities are sold out in the timber market.",
                [
                    aab("Common_Goldeneye", "lifehistory"),
                    audubon("common-goldeneye"),
                ],
            ),
            (
                "Within a day of hatch chicks obey whistles from below and parachute from nest holes—stunt rehearsals optional for these ducks.",
                [
                    aab("Common_Goldeneye", "lifehistory"),
                    "https://birdsoftheworld.org/bow/species/comgol/cur/introduction#repro",
                ],
            ),
            (
                "Courtship that throws the head far back until nape brushes mantle earns applause from binoculars for this duck.",
                [
                    aab("Common_Goldeneye", "lifehistory"),
                    "https://birdsoftheworld.org/bow/species/comgol/cur/introduction",
                ],
            ),
        ],
    ),
    (
        "Smew",
        "Mergellus albellus",
        [
            (
                "Known for fractured black-on-white patterning on the drake that birders liken to cracked ice, this duck wears winter couture.",
                [
                    "https://www.rspb.org.uk/birds-and-wildlife/wildlife-guides/bird-a-z/smew/",
                    aab("Smew", "overview"),
                ],
            ),
            (
                "Boreal lake summers and fresher winter coasts stamp the passport rhythm for these ducks.",
                [
                    "https://birdsoftheworld.org/bow/species/smew/cur/introduction#habitat",
                    "https://www.rspb.org.uk/birds-and-wildlife/wildlife-guides/bird-a-z/smew/",
                ],
            ),
            (
                "Petite sawbill silhouette beside chunkier fish-hunting relatives—size class jokes write themselves for these ducks.",
                [
                    "https://birdsoftheworld.org/bow/species/smew/cur/introduction#fieldid",
                    aab("Smew", "overview"),
                ],
            ),
            (
                "A compact genus epithet signals a small fish-eating lineage in references that track these ducks.",
                [
                    "https://birdsoftheworld.org/bow/species/smew/cur/introduction#nomen",
                    "https://www.rspb.org.uk/birds-and-wildlife/wildlife-guides/bird-a-z/smew/",
                ],
            ),
        ],
    ),
    (
        "Black Scoter",
        "Melanitta americana",
        [
            (
                "Known for velvety sooty-dark males sporting a bulbous orange-yellow bill knob in display, this duck carries built-in podium props.",
                [
                    aab("Black_Scoter", "overview"),
                    audubon("black-scoter"),
                ],
            ),
            (
                "Coastal bay winter rafts mixing with other dark diving companions—floating block parties suit these ducks.",
                [
                    aab("Black_Scoter", "lifehistory"),
                    audubon("black-scoter"),
                ],
            ),
            (
                "Underwater sprints after mollusks and crustaceans—blue-collar shift work for this duck.",
                [
                    aab("Black_Scoter", "food"),
                    aab("Black_Scoter", "lifehistory"),
                ],
            ),
            (
                "Whistling wingbeats on offshore watches give away flybys when ears join optics for these ducks.",
                [
                    aab("Black_Scoter", "sounds"),
                    audubon("black-scoter"),
                ],
            ),
        ],
    ),
]


def main() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(
            """
            PRAGMA foreign_keys = ON;
            DROP TABLE IF EXISTS fun_facts;
            DROP TABLE IF EXISTS species;
            CREATE TABLE species (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                scientific_name TEXT NOT NULL
            );
            CREATE TABLE fun_facts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                species_id INTEGER NOT NULL REFERENCES species(id) ON DELETE CASCADE,
                fact TEXT NOT NULL,
                citations TEXT NOT NULL
            );
            CREATE INDEX idx_fun_facts_species ON fun_facts(species_id);
            """
        )
        for name, sci, fact_rows in SPECIES_AND_FACTS:
            cur = conn.execute(
                "INSERT INTO species (name, scientific_name) VALUES (?, ?)",
                (name, sci),
            )
            sid = cur.lastrowid
            for fact_text, citation_urls in fact_rows:
                if not citation_urls:
                    raise ValueError(f"Fact for {name} must include at least one citation URL")
                conn.execute(
                    "INSERT INTO fun_facts (species_id, fact, citations) VALUES (?, ?, ?)",
                    (sid, fact_text, json.dumps(citation_urls)),
                )
        conn.commit()
        n_species = conn.execute("SELECT COUNT(*) FROM species").fetchone()[0]
        n_facts = conn.execute("SELECT COUNT(*) FROM fun_facts").fetchone()[0]
        print(f"Seeded {DB_PATH}")
        print(f"  species: {n_species}, fun_facts: {n_facts}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
    sys.exit(0)
