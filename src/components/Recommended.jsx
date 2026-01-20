export default function Recommended({ books }) 
{ const topFive = books.slice(0, 5); // first 5 books
 return ( 
 <div className="recommended-section">
   <h2>Recommended For You</h2> 
   <div className="recommended-list"> 
    {topFive.map((b) => ( <div key={b.id} 
    className="recommended-card">
       <img src={b.cover} alt={b.title} /> 
       <p>{b.title}</p>
        </div>
        ))}
         </div> 
         </div>
          ); }
