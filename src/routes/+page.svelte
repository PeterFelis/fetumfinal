<svelte:head>
    <title>Hoi! start hier | Fetum</title>
</svelte:head>


<div class="fullsize abs">
    <figure>
        <img
            src="/afbeeldingen/hp-136.jpg"
            alt="HP-136 degelijke hoofdtelefoon met opbergtas"
            class="fullsize"
        />
    </figure>

    <h1 class="introText">
        Hoofdtelefoons en electronica voor zorg, educatie en iedereen die we van
        dienst kunnen zijn.
    </h1>
</div>

<div class="container-fluid grid produkten">
    <div class="svgblob">
        <div class="rot">
            <img
                class="parentfit imgfit"
                src="/afbeeldingen/hp188.png"
                alt="hp-188"
            />
            <h2>Hoofdtelefoons</h2>
        </div>
    </div>

    <div class="svgblob">
        <div class="rot">
            <img
                class="parentfit imgfitcss"
                src="/afbeeldingen/hp-32.png"
                alt="hp32"
            />
            <h2>Oortjes</h2>
        </div>
    </div>

    <div class="svgblob">
        <div class="rot">
            <img
                class="parentfit imgfitcss"
                src="/afbeeldingen/i40.png"
                alt="i-40"
            />
            <h2>Doosjes</h2>
        </div>
    </div>
</div>

<div class="container p4">
    <div class="grid">
        <div class="grid vertcenter">
            <div>
                <h2 class="heelgroot center">Hai!</h2>
                <h2 class="center">Wij zijn Fetum.</h2>
            </div>
        </div>
        <div class="links">
            <h2>Wij leveren alles rond de computer op school.</h2>
            <p>
                De nadruk ligt op hoofdtelefoons en oortjes. Van
                budgetuitvoeringen voor grootverbruikers in de zorg tot op maat
                gemaakt voor het onderwijs.
            </p>
            <h2>We zijn u graag van dienst</h2>
            <button class="w50">Wat doen wij allemaal</button>
        </div>
    </div>
</div>

<div>
    <img
        class="fullwidth"
        src="/afbeeldingen/muis.png"
        alt="oranje draadloze muis"
    />
</div>

<svg width="0" height="0">
    <defs>
        <clipPath id="clip" clipPathUnits="objectBoundingBox">
            <path
                transform="scale(0.00049, 0.00043)"
                d="M 1000 2000 C 878.802 2000 767.675 1913.755 681.125 1770.278 C 518.075 1810.828 378.145 1793.33 292.282 1707.467 C 206.434 1621.619 188.927 1481.723 229.45 1318.71 C 86.135 1232.184 0 1121.122 0 1000 C 0 881.453 82.513 772.541 220.39 686.84 C 179.055 522.745 196.297 381.846 282.589 295.554 C 369.652 208.491 512.302 191.717 678.279 234.476 C 765.232 88.152 877.469 0 1000 0 C 1121.3 0 1232.512 86.39 1319.093 230.085 C 1481.527 189.995 1620.886 207.642 1706.496 293.253 C 1792.121 378.878 1809.76 518.272 1769.642 680.742 C 1913.501 767.347 2000 878.623 2000 1000 C 2000 1123.918 1909.842 1237.307 1760.534 1324.663 C 1799.893 1486.112 1782.009 1624.562 1696.803 1709.768 C 1612.399 1794.172 1475.75 1812.515 1316.252 1774.595 C 1230.086 1915.484 1119.978 2000 1000 2000 Z"
                style="fill: rgba(216, 216, 216); stroke: rgba(216, 216, 216);"
            />
        </clipPath>
    </defs>
</svg>

<style>
    .introText {
        text-align: center;
        position: absolute;
        top: 0vh;
        left: 0rem;
        width: 100%;
        padding:0 1rem 0 1rem;
    }

    .produkten {
        background-color: var(--paars);
    }
    .svgblob {
        clip-path: url(#clip);
        width: 100%;
        height: auto;
        background: rgba(255, 255, 255, 0.05);
        padding: 20%;
        transition: all 1s ease-in-out;
        transform: scale(0.8);
    }
    .svgblob:hover {
        transform: rotate(180deg) scale(1.1);
        background: rgba(255, 255, 255, 0.3);
    }
    .rot {
        transition: all 1s ease-in-out;
    }
    .svgblob:hover .rot {
        transform: rotate(-180deg);
    }


    @media (min-width: 991px) {
    .introText {
        text-align: center;
        position: absolute;
        top: 100vh;
        left: 0rem;
        width: 100%;
        padding:0 10rem 0 10rem;
    }
}
</style>
