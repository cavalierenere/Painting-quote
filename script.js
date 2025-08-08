(function(){
  const el = (id)=>document.getElementById(id);
  const fmt = (n)=>'£'+(Math.round(n*100)/100).toLocaleString(undefined,{minimumFractionDigits:2});

  const ids=[
    'jobDetails','quoteRef',
    'painters','days','dayRate','overtime','stairSurchargePct','tightSpacePct',
    'kWalls','kCeil','bWalls','bCeil','sWalls','sCeil','oWalls','oCeil',
    'exteriorArea','woodUnits','finishCoats','usePrimer',
    'intMethod','extMethod','spraySetup','sprayPerDay',
    'intCoverage','extCoverage','primerCoverage',
    'intPaintPrice','extPaintPrice','primerPrice',
    'woodUnitPrice','consumables','contingencyPct',
    'prepHours','prepRate','equipment','waste',
    'holesCount','holePrice','patchArea','patchPrice',
    'edgeLen','edgePrice','corniceLen','cornicePrice',
    'renderArea','renderPrice','timberLen','timberPrice',
    'discount'
  ];

  function totalInteriorAreas(){
    const walls = (+el('kWalls').value||0)+(+el('bWalls').value||0)+(+el('sWalls').value||0)+(+el('oWalls').value||0);
    const ceils = (+el('kCeil').value||0)+(+el('bCeil').value||0)+(+el('sCeil').value||0)+(+el('oCeil').value||0);
    return {walls, ceils, interior: walls+ceils};
  }

  function calc(){
    // Labour basics
    const painters=+el('painters').value||0;
    const days=+el('days').value||0;
    const dayRate=+el('dayRate').value||0;
    const overtime=+el('overtime').value||0;
    const stairPct=(+el('stairSurchargePct').value||0)/100;
    const tightPct=(+el('tightSpacePct').value||0)/100;

    // Areas
    const {interior} = totalInteriorAreas();
    const exteriorArea=+el('exteriorArea').value||0;
    const woodUnits=+el('woodUnits').value||0;

    // System
    const coats=+el('finishCoats').value||1;
    const usePrimer = el('usePrimer').value==='yes';

    // Methods
    const intMethod = el('intMethod').value;
    const extMethod = el('extMethod').value;
    const spraySetup = +el('spraySetup').value||0;
    const sprayPerDay = +el('sprayPerDay').value||0;
    const intCoverage=+el('intCoverage').value||1;
    const extCoverage=+el('extCoverage').value||1;
    const primerCoverage=+el('primerCoverage').value||1;

    // Prices
    const intPaintPrice=+el('intPaintPrice').value||0;
    const extPaintPrice=+el('extPaintPrice').value||0;
    const primerPrice=+el('primerPrice').value||0;
    const woodUnitPrice=+el('woodUnitPrice').value||0;
    const consumables=+el('consumables').value||0;
    const contingencyPct=+el('contingencyPct').value||0;
    const prepHours=+el('prepHours').value||0;
    const prepRate=+el('prepRate').value||0;
    const equipment=+el('equipment').value||0;
    const waste=+el('waste').value||0;
    const discount=+el('discount').value||0;

    // Defects
    const holesCount=+el('holesCount').value||0;
    const holePrice=+el('holePrice').value||0;
    const patchArea=+el('patchArea').value||0;
    const patchPrice=+el('patchPrice').value||0;
    const edgeLen=+el('edgeLen').value||0;
    const edgePrice=+el('edgePrice').value||0;
    const corniceLen=+el('corniceLen').value||0;
    const cornicePrice=+el('cornicePrice').value||0;
    const renderArea=+el('renderArea').value||0;
    const renderPrice=+el('renderPrice').value||0;
    const timberLen=+el('timberLen').value||0;
    const timberPrice=+el('timberPrice').value||0;

    // Spray modifiers
    const intCoverageFactor = (intMethod==='spray') ? 0.9 : 1.0; // spray needs ~10% more paint
    const extCoverageFactor = (extMethod==='spray') ? 0.9 : 1.0;

    // Litres (round up to whole litres)
    function litres(area, coats, coverage, factor){
      const raw = area * coats / (coverage*factor);
      return Math.ceil(raw);
    }
    const intLitres = litres(interior, coats, intCoverage, intCoverageFactor);
    const extLitres = litres(exteriorArea, coats, extCoverage, extCoverageFactor);
    const primLitres = usePrimer ? Math.ceil((interior + exteriorArea) / primerCoverage) : 0;

    // Costs
    const labourBase = painters * days * dayRate + overtime;
    const prepCost = prepHours * prepRate;
    const stairUplift = (labourBase + prepCost) * stairPct;
    const tightUplift = (labourBase + prepCost) * tightPct;

    const paintCost = intLitres*intPaintPrice + extLitres*extPaintPrice + primLitres*primerPrice;
    const woodCost = woodUnits * woodUnitPrice;
    const equipWaste = equipment + waste;
    const consumCost = consumables;

    const defectCost = holesCount*holePrice + patchArea*patchPrice + edgeLen*edgePrice + corniceLen*cornicePrice + renderArea*renderPrice + timberLen*timberPrice;

    const sprayCost = ((intMethod==='spray' || extMethod==='spray') ? spraySetup : 0) +
                      ((intMethod==='spray' ? days : 0) + (extMethod==='spray' ? days : 0)) * sprayPerDay;

    const subtotalBeforeCont = labourBase + stairUplift + tightUplift + prepCost + paintCost + woodCost + defectCost + equipWaste + consumCost + sprayCost;
    const contingency = subtotalBeforeCont * (contingencyPct/100);
    const subtotal = subtotalBeforeCont + contingency;
    const grand = subtotal - discount;

    // Output
    el('labourTotal').textContent = fmt(labourBase);
    el('stairSurcharge').textContent = fmt(stairUplift);
    el('tightSurcharge').textContent = fmt(tightUplift);
    el('prepTotal').textContent = fmt(prepCost);
    el('paintTotal').textContent = fmt(paintCost);
    el('woodTotal').textContent = fmt(woodCost);
    el('defectTotal').textContent = fmt(defectCost);
    el('equipWasteTotal').textContent = fmt(equipWaste);
    el('consumTotal').textContent = fmt(consumCost);
    el('sprayCosts').textContent = fmt(sprayCost);
    el('contingency').textContent = fmt(contingency);
    el('subtotal').textContent = fmt(subtotal);
    el('discountOut').textContent = '-'+fmt(discount);
    el('grandTotal').textContent = fmt(grand);

    el('intLitres').textContent = intLitres;
    el('extLitres').textContent = extLitres;
    el('primLitres').textContent = primLitres;
  }

  // Presets
  function applyPreset(kind){
    const base = {
      painters:2, days:5, dayRate:180, overtime:0, stairSurchargePct:0, tightSpacePct:0,
      finishCoats:2, usePrimer:'no',
      intMethod:'roller', extMethod:'roller',
      spraySetup:50, sprayPerDay:20,
      intCoverage:12, extCoverage:8, primerCoverage:10,
      intPaintPrice:8.5, extPaintPrice:12, primerPrice:9,
      woodUnitPrice:25, consumables:30, contingencyPct:5,
      holesCount:0, holePrice:1.5, patchArea:0, patchPrice:18,
      edgeLen:0, edgePrice:2, corniceLen:0, cornicePrice:12,
      renderArea:0, renderPrice:28, timberLen:0, timberPrice:6,
      prepHours:0, prepRate:25, equipment:0, waste:0,
      discount:0
    };
    if(kind==='interior'){
      base.usePrimer='no';
      base.finishCoats=2;
    }else if(kind==='refurb'){
      base.usePrimer='yes';
      base.finishCoats=2;
      base.dayRate=190;
      base.consumables=50;
      base.contingencyPct=8;
      base.patchPrice=22;
    }else if(kind==='exterior'){
      base.usePrimer='no';
      base.finishCoats=2;
      base.extMethod='spray';
      base.sprayPerDay=25;
      ['kWalls','kCeil','bWalls','bCeil','sWalls','sCeil','oWalls','oCeil'].forEach(id=>{ document.getElementById(id).value=0; });
    }
    Object.entries(base).forEach(([k,v])=>{
      const node=document.getElementById(k);
      if(!node) return;
      if(node.tagName==='SELECT'){ node.value=String(v); }
      else node.value=String(v);
    });
    calc();
  }

  // Save/Load/Reset/Print
  function saveJob(){
    const data={};
    ids.forEach(id=>data[id]=document.getElementById(id).value);
    localStorage.setItem('paintingQuoteJobV3', JSON.stringify(data));
    alert('Saved locally.');
  }
  function loadJob(){
    const raw=localStorage.getItem('paintingQuoteJobV3');
    if(!raw){ alert('Nothing saved yet.'); return; }
    const data=JSON.parse(raw);
    ids.forEach(id=>{ if(data[id]!==undefined) document.getElementById(id).value = data[id]; });
    calc();
  }
  function resetAll(){
    if(!confirm('Reset all fields?')) return;
    ids.forEach(id=>{
      const node=document.getElementById(id);
      if(node && node.tagName==='SELECT') node.selectedIndex=0;
      else if(node) node.value=0;
    });
    applyPreset('interior');
  }

  // Hook events
  ids.forEach(id=>{
    const node=el(id);
    if(!node) return;
    node.addEventListener('input', calc);
    node.addEventListener('change', calc);
  });
  Array.from(document.querySelectorAll('[data-preset]')).forEach(btn=>{
    btn.addEventListener('click', ()=>applyPreset(btn.dataset.preset));
  });
  el('saveBtn').addEventListener('click', saveJob);
  el('loadBtn').addEventListener('click', loadJob);
  el('resetBtn').addEventListener('click', resetAll);
  el('printBtn').addEventListener('click', ()=>window.print());

  // Init
  applyPreset('interior');
})();