# Performance Tab and Flame Chart analysis

Now that we are aware of the different steps in the browser render pipeline, it's time to apply
this knowledge to the performance analysis process. 
In this exercise you will learn the basics of black box performance auditing by using
the `Performance Tab` of the Chrome Dev Tools.

Before you start, serve the application, open your browser and the dev tools.

**Serve**

```bash
npx nx serve movies --open
```

Your application should be served at
> [http://localhost:4200](http://localhost:4200)

**Open Dev Tools**

`F12` or `Ctrl + Shift + I`

## 1. Measure & Identify LCP

Run a bootstrap performance analysis by either hitting `Start profiling and reload page` or
`Ctrl + Shift + E`.

![record-and-reload](images/performance-tab/record-and-reload.png)

After the report got analysed and is visible for you in the dev tools, search for the `LCP` 
Core Web Vital in the bottom section of your screen.

![cwv-bottom.png](images/performance-tab/cwv-bottom.png)

Find out when it is happening and what the browser has identified as `LCP`.

In order to identify the `LCP` you might want to consider taking a look at the `Summary` section.

![lcp summary](images/performance-tab/lcp-summary.png)

<details>
  <summary>Or use the Insights Panel</summary>

![lcp-insights](images/performance-tab/lcp-insights.png)

</details>


## 2. Find out how long it takes from visible app-skeleton until list is visible

To solve this task you need to take a look at the `Screenshots` section (the filmstrip at the top of the recording).

> [!NOTE]
> **REMEMBER** to tick the checkbox `Screenshots` in the `Performance` tab if it's not already ticked.

Your first task for this exercise will be to identify the point in time when the initial **loading screen disappears**.

### 2.1 **Initial Loading Screen**

![initial-loading-screen](images/performance-tab/initial-loading-screen.png)

If you have identified it, please go ahead and find the timing when the **movie list data is visible**.

### 2.2 **Movie List Data**

![movie-list-data](images/performance-tab/movie-list-data.png)

Please mark the corresponding area between those two points in time and report
the values shown in the `Summary` section.

> [!TIP]
> You can use the screenshot section to fine-control the visible area. 
> To mark a section consider using `Shift + Mouse1` + dragging the mouse to select the area.

<details>
  <summary>Example: Mark a section area</summary>

![mark-area.gif](images/performance-tab/mark-area.gif)

</details>


![summary](images/performance-tab/summary.png)

## 3. Find the MovieListPageComponent creation

In this exercise you should use the `search` functionality to find the
time when the `MovieListPageComponent` is created.

Press `Ctrl + F` (Mac: `⌘ CMD + F`) in order to conduct a search in the flame charts. 

Search for `MovieListPageComponent` and select the `MovieListPageComponent_Factory` match.

<details>
  <summary>Show Help</summary>

![movie-list-component-bootstrap](images/performance-tab/movie-list-component-bootstrap.png)

</details>

## 4. Throttle your CPU and measure a navigation click (INP)

### 4.1 Throttle your CPU

Select `4x slowdown` in the `CPU` throttling dropdown.

Chrome should allow for an up to `20x CPU throttling`. 
Depending on your hardware it makes sense to throttle your system while doing performance tests.
Otherwise, you'll never know how people with less powerful machines experience your app.

![cpu-throttle.png](images/performance-tab/cpu-throttle.png)

Keep that setting active for the next measurements. You can also always compare throttled vs.
unthrottled measurements in the future.

> [!WARNING]
> Throttling makes everything in this tab slow. Make sure to disable throttling when you're done measuring.

### 4.2 Measure INP / Interaction times on route switch

Start a recording (`Record`, no reload), click one item in the sidebar (e.g. `Top Rated`) and stop the recording.
Always record a single interaction at once.

You should be able to see the `Interactions` track, showing you the exact timings of the
pointer event.

![route-click-interaction.png](images/performance-tab/route-click-interaction.png)

Try to understand what's causing high interaction times here. You might find something
suspicious that shouldn't happen on the click event :).

<details>
  <summary>Hint</summary>

![interaction-hint.png](images/performance-tab/interaction-hint.png)

</details>

<details>
  <summary>Solution</summary>

`AppShellComponent.trackNavigation` calls `TrackingService.trackEvent` (`libs/shared/utils/src/lib/tracking.service.ts`)
on every sidebar click: a loop with 10 million iterations inside the click handler.

</details>

## If you have time

### 5. Measure INP / Interaction times on other interactions

Analyze other interactions, and try to understand what you see there, such as:

* Typing in the search-bar
* Opening/closing the search-bar
* Hover in movie-card to trigger the tilt effect
* Navigating to a detail view

### 6. Compare consecutive recordings

Go ahead and do another bootstrap recording as described in
step 1 of this exercise.
After the report was analysed and is visible for you, you'll notice
that the dropdown menu in the top-bar of the Dev Tools is now
enabled.

Switch between the recordings in order to get a feeling of how to
compare multiple recordings in a single
instance of the Chrome Dev Tools. 

You'll most probably notice that the outcome of the measurements can be 
quite different at times. This is the reason
why we always should do multiple recordings!

![multiple recordings](images/performance-tab/multiple-recordings.png)

### 7. Save & import recordings

If you want to share your recording with others, the dev tools provide
you with the feature to save an existing recording.

Hit the export button and save the current recording to disk.

![save recording](images/performance-tab/save-recording.png)

Great, now open your browser to a new empty tab and open a second instance of the 
Chrome Dev Tools by hitting `F12` or `Ctrl + Shift + I`.

Now you can import your formerly saved recording in a new instance, thus
having the ability to compare
multiple recordings directly next to each other.

![import recording](images/performance-tab/import-recording.png)

### 8. Bonus: Find optimisation potential

In this exercise you can now investigate the flame charts on your own and try to find suspicious tasks that
potentially could be reduced, moved or erased completely.

Please note down your findings, so we can discuss them afterwards :-).
