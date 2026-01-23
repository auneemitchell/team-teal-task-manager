import { useParams, Link } from "react-router-dom";

/* This is a sample of a page / route target
 */
export default function TaskDetail() {
  // useParams() gets the /:id from the route patern
  const { id } = useParams();

  // In the actual app, the task detail page would use the id to fetch the task info from the db

  return (
    <div>
      {/** 'Link' is a special version of <a> that lets us navigate around the app WITHOUT having to
       * completely reload the app and all the javascript and everything. Basically it's how we swap
       * components while also changing the url / browser history
       */}
      <Link to="/">← Home</Link>
      <h1>Task {id}</h1>
      <p>Placeholder detailed task view.</p>
    </div>
  );
}
